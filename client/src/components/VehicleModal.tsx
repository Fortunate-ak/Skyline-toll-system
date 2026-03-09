import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: number;
  initialData?: {
    plateName: string;
    vehicleType: string;
    brand: string;
    model: string;
    color: string;
  };
}

export function VehicleModal({ isOpen, onClose, vehicleId, initialData }: VehicleModalProps) {
  const [formData, setFormData] = useState(
    initialData || {
      plateName: "",
      vehicleType: "car",
      brand: "",
      model: "",
      color: "",
    }
  );

  const addVehicleMutation = trpc.vehicles.add.useMutation();
  const updateVehicleMutation = trpc.vehicles.update.useMutation();
  const utils = trpc.useUtils();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (vehicleId) {
        await updateVehicleMutation.mutateAsync({
          id: vehicleId,
          ...formData,
        });
        toast.success("Vehicle updated successfully");
      } else {
        await addVehicleMutation.mutateAsync(formData);
        toast.success("Vehicle added successfully");
      }
      await utils.vehicles.list.invalidate();
      onClose();
    } catch (error) {
      toast.error("Failed to save vehicle");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vehicleId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">License Plate</label>
            <Input
              type="text"
              name="plateName"
              placeholder="ABC 123"
              value={formData.plateName}
              onChange={handleInputChange}
              className="input-elegant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="input-elegant"
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="van">Van</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Brand</label>
              <Input
                type="text"
                name="brand"
                placeholder="Toyota"
                value={formData.brand}
                onChange={handleInputChange}
                className="input-elegant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Model</label>
              <Input
                type="text"
                name="model"
                placeholder="Corolla"
                value={formData.model}
                onChange={handleInputChange}
                className="input-elegant"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color</label>
            <Input
              type="text"
              name="color"
              placeholder="Silver"
              value={formData.color}
              onChange={handleInputChange}
              className="input-elegant"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={onClose} className="flex-1 btn-ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addVehicleMutation.isPending || updateVehicleMutation.isPending}
              className="flex-1 btn-primary"
            >
              {vehicleId ? "Update" : "Add"} Vehicle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
