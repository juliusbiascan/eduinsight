import { NextResponse } from "next/server";
import si from 'systeminformation';

export async function GET() {
  try {
    const [system, cpu, mem, temp, osInfo, time, fsSize] = await Promise.all([
      si.system(),
      si.cpu(),
      si.mem(),
      si.cpuTemperature(),
      si.osInfo(),
      si.time(),
      si.fsSize(),
    ]);

    const cpuLoad = await si.currentLoad();

    return NextResponse.json({
      hostname: system.model,
      platform: osInfo.platform,
      distro: osInfo.distro,
      arch: osInfo.arch,
      cpuModel: cpu.manufacturer + ' ' + cpu.brand,
      cores: {
        physical: cpu.physicalCores,
        logical: cpu.cores,
        speeds: cpu.speed,
      },
      temperature: {
        main: temp.main,
        cores: temp.cores,
      },
      cpuLoad: {
        currentLoad: cpuLoad.currentLoad,
        coresLoad: cpuLoad.cpus.map(core => core.load),
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
      },
      storage: {
        devices: fsSize.map(fs => ({
          fs: fs.fs,
          type: fs.type,
          size: fs.size,
          used: fs.used,
          available: fs.available,
          mount: fs.mount,
          usePercent: fs.use
        }))
      },
      uptime: time.uptime,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch system information" }, { status: 500 });
  }
}
