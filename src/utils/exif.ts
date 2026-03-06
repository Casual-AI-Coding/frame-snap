// EXIF metadata types
export interface ExifData {
  make?: string; // 相机制造商
  model?: string; // 相机型号
  software?: string; // 软件
  dateTime?: string; // 拍摄时间
  dateTimeOriginal?: string; // 原始拍摄时间
  exposureTime?: string; // 快门速度
  fNumber?: string; // 光圈
  iso?: number; // ISO
  focalLength?: string; // 焦距
  lensModel?: string; // 镜头型号
  gpsLatitude?: string; // 纬度
  gpsLongitude?: string; // 经度
  gpsAltitude?: string; // 海拔
  imageWidth?: number; // 图片宽度
  imageHeight?: number; // 图片高度
  orientation?: number; // 方向
  flash?: string; // 闪光灯
  whiteBalance?: string; // 白平衡
  exposureProgram?: string; // 曝光程序
  meteringMode?: string; // 测光模式
}

// Parse EXIF from image source
export function parseExif(imageSrc: string): Promise<ExifData> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Try to get EXIF from the image element
      // @ts-expect-error - exif data is available on HTMLImageElement in some browsers
      const exif = img.exifData;
      if (exif) {
        resolve(formatExifData(exif));
      } else {
        // If no EXIF in img, try to parse from base64
        parseExifFromBase64(imageSrc).then(resolve).catch(() => resolve({}));
      }
    };
    img.onerror = () => resolve({});
    img.src = imageSrc;
  });
}

// Parse EXIF from base64 string
async function parseExifFromBase64(base64: string): Promise<ExifData> {
  return new Promise((resolve) => {
    try {
      // Use dynamic import for exif-js
      import("exif-js").then((EXIF) => {
        // Create a temporary image to load the base64
        const img = new Image();
        img.onload = () => {
          // @ts-expect-error - exif-js adds this method
          EXIF.getData(img, function () {
            const allTags = EXIF.getAllTags(this);
            if (allTags && Object.keys(allTags).length > 0) {
              resolve(formatExifData(allTags));
            } else {
              resolve({});
            }
          });
        };
        img.onerror = () => resolve({});
        img.src = base64;
      }).catch(() => resolve({}));
    } catch {
      resolve({});
    }
  });
}

// Format raw EXIF data to clean structure
function formatExifData(raw: Record<string, unknown>): ExifData {
  const data: ExifData = {};

  // Make & Model
  if (raw.Make) data.make = String(raw.Make);
  if (raw.Model) data.model = String(raw.Model);
  if (raw.Software) data.software = String(raw.Software);

  // Date/Time
  if (raw.DateTime) data.dateTime = String(raw.DateTime);
  if (raw.DateTimeOriginal) data.dateTimeOriginal = String(raw.DateTimeOriginal);

  // Exposure settings
  if (raw.ExposureTime) {
    const exp = raw.ExposureTime as number;
    if (exp < 1) {
      data.exposureTime = `1/${Math.round(1 / exp)}`;
    } else {
      data.exposureTime = `${exp}`;
    }
  }

  if (raw.FNumber) {
    const f = raw.FNumber as number;
    data.fNumber = `f/${f}`;
  }

  if (raw.ISOSpeedRatings) {
    data.iso = Number(raw.ISOSpeedRatings);
  }

  if (raw.FocalLength) {
    const fl = raw.FocalLength as number;
    data.focalLength = `${fl}mm`;
  }

  if (raw.LensModel) data.lensModel = String(raw.LensModel);

  // GPS
  if (raw.GPSLatitude) {
    data.gpsLatitude = formatGPS(raw.GPSLatitude, raw.GPSLatitudeRef);
  }
  if (raw.GPSLongitude) {
    data.gpsLongitude = formatGPS(raw.GPSLongitude, raw.GPSLongitudeRef);
  }
  if (raw.GPSAltitude) {
    data.gpsAltitude = `${raw.GPSAltitude} m`;
  }

  // Image info
  if (raw.ImageWidth) data.imageWidth = Number(raw.ImageWidth);
  if (raw.ImageHeight) data.imageHeight = Number(raw.ImageHeight);
  if (raw.Orientation) data.orientation = Number(raw.Orientation);

  // Other
  if (raw.Flash) data.flash = String(raw.Flash);
  if (raw.WhiteBalance) data.whiteBalance = String(raw.WhiteBalance);
  if (raw.ExposureProgram) data.exposureProgram = String(raw.ExposureProgram);
  if (raw.MeteringMode) data.meteringMode = String(raw.MeteringMode);

  return data;
}

// Format GPS coordinates
function formatGPS(lat: unknown, ref: unknown): string {
  if (!lat || !Array.isArray(lat)) return "";
  const degrees = (lat[0] as number) || 0;
  const minutes = (lat[1] as number) || 0;
  const seconds = (lat[2] as number) || 0;
  const direction = ref ? String(ref) : "";
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Get display-friendly EXIF string
export function getExifDisplayText(data: ExifData): string {
  const parts: string[] = [];

  // Camera info
  if (data.model) parts.push(data.model);
  else if (data.make) parts.push(data.make);

  // Exposure settings
  if (data.exposureTime) parts.push(data.exposureTime);
  if (data.fNumber) parts.push(data.fNumber);
  if (data.iso) parts.push(`ISO ${data.iso}`);

  // Lens
  if (data.lensModel) parts.push(data.lensModel);

  // Date
  if (data.dateTimeOriginal) {
    // Extract just the date part
    const date = data.dateTimeOriginal.split(" ")[0];
    parts.push(date);
  }

  return parts.join(" | ");
}

// Check if EXIF data is available
export function hasExifData(data: ExifData): boolean {
  return !!(
    data.make ||
    data.model ||
    data.dateTime ||
    data.dateTimeOriginal ||
    data.exposureTime ||
    data.fNumber ||
    data.iso ||
    data.focalLength ||
    data.lensModel ||
    data.gpsLatitude
  );
}
