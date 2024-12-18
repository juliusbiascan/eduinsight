import { db } from "@/lib/db";
import { DeviceForm } from "./components/device-form";

const ProductPage = async ({ params }: { params: { devId: string, labId: string } }) => {
  const device = await db.device.findUnique({
    where: {
      id: params.devId
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <DeviceForm
          initialData={device}
        />
      </div>
    </div>
  )
}

export default ProductPage;