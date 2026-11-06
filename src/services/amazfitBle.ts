import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import {
  DiscoveredWatch,
  HUAMI_BLE_UUIDS,
  WorkoutMode,
} from '../types/workout';

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: number[]): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i] & 0xff;
    const b2 = i + 1 < bytes.length ? bytes[i + 1] & 0xff : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] & 0xff : 0;

    const triplet = (b1 << 16) | (b2 << 8) | b3;

    output += BASE64_CHARS[(triplet >> 18) & 0x3f];
    output += BASE64_CHARS[(triplet >> 12) & 0x3f];
    output += i + 1 < bytes.length ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    output += i + 2 < bytes.length ? BASE64_CHARS[triplet & 0x3f] : '=';
  }
  return output;
}

export function bytesToHex(bytes: number[]): string {
  return bytes
    .map((b) => (b & 0xff).toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

export type WorkoutControlAction = 'start' | 'pause' | 'resume' | 'stop';

const ACTION_STATE_BYTE: Record<WorkoutControlAction, number> = {
  start: 0x01,
  pause: 0x02,
  resume: 0x03,
  stop: 0x00,
};

export function buildWorkoutCommandBytes(
  workout: WorkoutMode,
  action: WorkoutControlAction
): number[] {
  return [0x06, 0x17, 0x00, workout.huamiOpCode, ACTION_STATE_BYTE[action]];
}

export function buildScreenLockBytes(enableLock: boolean): number[] {
  return [0x06, 0x05, 0x00, enableLock ? 0x01 : 0x00];
}

interface GattCandidate {
  serviceUUID: string;
  charUUID: string;
  isWritableWithoutResponse: boolean;
  isWritableWithResponse: boolean;
}

class AmazfitBleController {
  private manager: BleManager | null = null;
  private initError: string | null = null;
  private activeDevice: Device | null = null;
  private lastDeviceId: string | null = null;
  private cachedCharacteristics: Characteristic[] = [];

  private getManager(): BleManager {
    if (this.manager) {
      return this.manager;
    }
    if (Platform.OS === 'web') {
      throw new Error(
        'Modul Bluetooth native hanya berjalan di perangkat Android fisik. Gunakan Mode Simulasi saat membuka di browser.'
      );
    }
    try {
      this.manager = new BleManager();
      return this.manager;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memuat modul BLE native';
      this.initError = msg;
      throw new Error(
        `Modul BLE native belum tersedia di lingkungan ini (${msg}). Jalankan build Android native atau gunakan Mode Simulasi.`
      );
    }
  }

  public getInitError(): string | null {
    return this.initError;
  }

  public async requestAndroidBlePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    const apiLevel =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10);

    if (apiLevel >= 31) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const fineLocation = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return fineLocation === PermissionsAndroid.RESULTS.GRANTED;
  }

  public async scanForWatches(
    onWatchFound: (watch: DiscoveredWatch) => void,
    onError: (message: string) => void
  ): Promise<void> {
    const manager = this.getManager();
    const granted = await this.requestAndroidBlePermissions();
    if (!granted) {
      onError(
        'Izin Bluetooth dan Lokasi ditolak. Buka Pengaturan Android dan izinkan akses perangkat di sekitar untuk memindai Amazfit Verge.'
      );
      return;
    }

    // Check devices already bonded/connected through the Zepp app first
    try {
      const connectedViaZepp = await manager.connectedDevices([
        HUAMI_BLE_UUIDS.PRIMARY_SERVICE,
        HUAMI_BLE_UUIDS.AUTH_SERVICE,
      ]);
      for (const dev of connectedViaZepp) {
        const displayName =
          dev.name || dev.localName || 'Amazfit (Terhubung via Zepp)';
        onWatchFound({
          id: dev.id,
          name: displayName,
          rssi: dev.rssi,
          isVergeLiteCandidate: true,
        });
      }
    } catch {
      // Ignore if connectedDevices query fails on older Android stacks
    }

    manager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          onError(`Gagal memindai BLE: ${error.message}`);
          return;
        }
        if (!device) {
          return;
        }
        const rawName = device.name || device.localName || '';
        const lower = rawName.toLowerCase();
        const serviceUuids = (device.serviceUUIDs || []).map((u) =>
          u.toLowerCase()
        );
        const isHuamiService =
          serviceUuids.includes(HUAMI_BLE_UUIDS.PRIMARY_SERVICE) ||
          serviceUuids.includes(HUAMI_BLE_UUIDS.AUTH_SERVICE);
        const isVergeLiteCandidate =
          isHuamiService ||
          lower.includes('amazfit') ||
          lower.includes('verge') ||
          lower.includes('huami') ||
          lower.includes('zepp') ||
          lower.includes('a1811') ||
          lower.includes('a1818') ||
          device.id.toLowerCase().includes('d8:80:3c:2a:e4:57');

        if (rawName.length > 0 || isVergeLiteCandidate) {
          onWatchFound({
            id: device.id,
            name: rawName || 'Perangkat Huami Tanpa Nama',
            rssi: device.rssi,
            isVergeLiteCandidate,
          });
        }
      }
    );
  }

  public stopScan(): void {
    if (this.manager) {
      this.manager.stopDeviceScan();
    }
  }

  private async refreshDeviceAndCharacteristics(
    deviceId: string
  ): Promise<Characteristic[]> {
    const manager = this.getManager();
    this.stopScan();

    let device = this.activeDevice;
    let isCurrentlyConnected = false;

    if (device && device.id.toLowerCase() === deviceId.toLowerCase()) {
      try {
        isCurrentlyConnected = await device.isConnected();
      } catch {
        isCurrentlyConnected = false;
      }
    }

    if (!device || !isCurrentlyConnected) {
      device = await manager.connectToDevice(deviceId, {
        autoConnect: false,
        timeout: 10000,
      });
    }

    const prepared = await device.discoverAllServicesAndCharacteristics();
    this.activeDevice = prepared;
    this.lastDeviceId = prepared.id;

    const chars: Characteristic[] = [];
    try {
      const services = await prepared.services();
      for (const service of services) {
        try {
          const cList = await service.characteristics();
          chars.push(...cList);
        } catch {
          // Continue to next service
        }
      }
    } catch {
      // Keep empty array if enumeration fails
    }

    this.cachedCharacteristics = chars;
    return chars;
  }

  public async connectToWatch(deviceId: string): Promise<Device> {
    await this.refreshDeviceAndCharacteristics(deviceId);
    if (!this.activeDevice) {
      throw new Error('Gagal membuka sesi GATT ke Amazfit Verge.');
    }
    return this.activeDevice;
  }

  public getDiscoveredCharacteristicsSummary(): string {
    if (this.cachedCharacteristics.length === 0) {
      return 'Karakteristik standar Huami aktif';
    }
    return this.cachedCharacteristics
      .map((c) => {
        const shortSvc =
          c.serviceUUID.length > 8 ? c.serviceUUID.slice(0, 8) : c.serviceUUID;
        const shortUuid = c.uuid.length > 8 ? c.uuid.slice(0, 8) : c.uuid;
        const flags = [
          c.isReadable ? 'R' : '',
          c.isWritableWithoutResponse ? 'WNR' : '',
          c.isWritableWithResponse ? 'WR' : '',
          c.isNotifiable ? 'N' : '',
        ]
          .filter(Boolean)
          .join('/');
        return `${shortSvc}:${shortUuid}${flags ? `(${flags})` : ''}`;
      })
      .join(', ');
  }

  public async disconnectWatch(): Promise<void> {
    if (this.activeDevice) {
      try {
        await this.activeDevice.cancelConnection();
      } catch {
        // Ignore disconnect errors if watch already dropped link
      }
      this.activeDevice = null;
      this.lastDeviceId = null;
      this.cachedCharacteristics = [];
    }
  }

  private buildRankedCandidates(chars: Characteristic[]): GattCandidate[] {
    const ordered: Characteristic[] = [];
    const addUnique = (list: Characteristic[]) => {
      for (const item of list) {
        const exists = ordered.some(
          (x) =>
            x.serviceUUID.toLowerCase() === item.serviceUUID.toLowerCase() &&
            x.uuid.toLowerCase() === item.uuid.toLowerCase()
        );
        if (!exists) {
          ordered.push(item);
        }
      }
    };

    const writable = chars.filter(
      (c) => c.isWritableWithoutResponse || c.isWritableWithResponse
    );

    // Priority 1: characteristic containing "0003" (Huami Configuration & Control Point)
    addUnique(
      writable.filter((c) => c.uuid.toLowerCase().includes('0003'))
    );

    // Priority 2: characteristic containing "0001" (Huami Action / Sensor Control)
    addUnique(
      writable.filter((c) => c.uuid.toLowerCase().includes('0001'))
    );

    // Priority 3: any writable characteristic under Huami services fee0 or fee1
    addUnique(
      writable.filter(
        (c) =>
          c.serviceUUID.toLowerCase().includes('fee0') ||
          c.serviceUUID.toLowerCase().includes('fee1')
      )
    );

    // Priority 4: Amazfit Verge A1811 / Huami custom writable characteristic (such as 0000fedd)
    addUnique(writable);

    return ordered.map((c) => ({
      serviceUUID: c.serviceUUID,
      charUUID: c.uuid,
      isWritableWithoutResponse: c.isWritableWithoutResponse,
      isWritableWithResponse: c.isWritableWithResponse,
    }));
  }

  public async sendRawBytes(
    bytes: number[],
    fallbackDeviceId?: string
  ): Promise<string> {
    const targetDeviceId =
      this.activeDevice?.id || this.lastDeviceId || fallbackDeviceId || null;

    if (!targetDeviceId) {
      throw new Error(
        'Jam tangan belum terhubung. Hubungkan Amazfit Verge A1811 (D8:80:3C:2A:E4:57) terlebih dahulu atau aktifkan Mode Simulasi.'
      );
    }

    const manager = this.getManager();
    const payloadBase64 = bytesToBase64(bytes);

    // Always verify live connection and refresh GATT service/characteristic table
    // right before writing so integer handles inside react-native-ble-plx never go stale.
    const freshChars = await this.refreshDeviceAndCharacteristics(targetDeviceId);
    const candidates = this.buildRankedCandidates(freshChars);

    if (candidates.length === 0) {
      const available =
        freshChars
          .map((c) => {
            const s = c.serviceUUID.slice(0, 8);
            const u = c.uuid.slice(0, 8);
            return `${s}:${u}`;
          })
          .join(', ') || 'tidak ada karakteristik GATT terbaca';
      throw new Error(
        `Tidak ditemukan karakteristik GATT yang dapat ditulisi pada jam (${targetDeviceId}). Semua karakteristik terdeteksi: [${available}].`
      );
    }

    let lastErrorMsg = '';

    for (const candidate of candidates) {
      const shortSvc =
        candidate.serviceUUID.length > 8
          ? candidate.serviceUUID.slice(0, 8)
          : candidate.serviceUUID;
      const shortChar =
        candidate.charUUID.length > 8
          ? candidate.charUUID.slice(0, 8)
          : candidate.charUUID;

      // Try WriteWithResponse first if supported (more reliable on Android 5.1.1 / A1811 GATT server),
      // then fallback to WriteWithoutResponse.
      const methodsToTry: Array<'withResponse' | 'withoutResponse'> = [];
      if (candidate.isWritableWithResponse) {
        methodsToTry.push('withResponse');
      }
      if (candidate.isWritableWithoutResponse) {
        methodsToTry.push('withoutResponse');
      }

      for (const method of methodsToTry) {
        try {
          // Ensure connection did not drop from a previous write attempt
          const stillConnected = await manager
            .isDeviceConnected(targetDeviceId)
            .catch(() => false);
          if (!stillConnected) {
            await this.refreshDeviceAndCharacteristics(targetDeviceId);
          }

          if (method === 'withResponse') {
            await manager.writeCharacteristicWithResponseForDevice(
              targetDeviceId,
              candidate.serviceUUID,
              candidate.charUUID,
              payloadBase64
            );
            return `${shortSvc}:${shortChar} (WithResponse)`;
          } else {
            await manager.writeCharacteristicWithoutResponseForDevice(
              targetDeviceId,
              candidate.serviceUUID,
              candidate.charUUID,
              payloadBase64
            );
            return `${shortSvc}:${shortChar} (NoResponse)`;
          }
        } catch (err) {
          lastErrorMsg = err instanceof Error ? err.message : String(err);
        }
      }
    }

    const triedList = candidates
      .map((c) => `${c.serviceUUID.slice(0, 8)}:${c.charUUID.slice(0, 8)}`)
      .join(', ');

    throw new Error(
      `Gagal menulis ke karakteristik GATT (${triedList}): ${
        lastErrorMsg || 'Koneksi diputus oleh jam tangan'
      }`
    );
  }
}

export const amazfitBle = new AmazfitBleController();
