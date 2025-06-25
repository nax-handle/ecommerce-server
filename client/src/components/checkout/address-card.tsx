"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AddressForm } from "../address/address-form";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  isDefault: boolean;
}

interface AddressCardProps {
  userName: string;
  address: string;
}

export function AddressCard({ userName, address }: AddressCardProps) {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const addresses: Address[] = [
    {
      id: 1,
      fullName: "Nguyễn Văn A",
      phone: "0123456789",
      street: "123 Đường Lê Lợi",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      state: "Hồ Chí Minh",
      country: "Vietnam",
      latitude: 10.762622,
      longitude: 106.660172,
      note: "",
      isDefault: true,
    },
    {
      id: 2,
      fullName: "Nguyễn Văn B",
      phone: "0987654321",
      street: "45 Đường Phan Đình Phùng",
      ward: "Phường Điện Biên",
      district: "Quận Ba Đình",
      city: "Hà Nội",
      state: "Hà Nội",
      country: "Vietnam",
      latitude: 21.033333,
      longitude: 105.849998,
      note: "",
      isDefault: false,
    },
  ];
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MapPin className="text-red-500 mt-1" />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-red-500 font-medium">Địa Chỉ Nhận Hàng</h2>
            </div>
            <div className="flex items-center gap-4 mb-1">
              <span className="font-medium">{userName}</span>
              <span>{address}</span>
            </div>
            <Dialog
              open={isAddressDialogOpen}
              onOpenChange={setIsAddressDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-600 p-0 h-auto">
                  Thay Đổi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>Địa Chỉ Của Tôi</DialogTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsAddressDialogOpen(false)}
                    >
                      X
                    </Button>
                  </div>
                </DialogHeader>

                {!showNewAddressForm ? (
                  <>
                    <div className="space-y-4 py-4">
                      <RadioGroup
                        value={selectedAddress}
                        onValueChange={setSelectedAddress}
                        className="space-y-3"
                      >
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="flex items-start space-x-3 rounded-lg border p-4"
                          >
                            <RadioGroupItem
                              value={addr.id.toString()}
                              id={addr.id.toString()}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={addr.id.toString()}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <div>
                                  <span className="font-medium">
                                    {addr.fullName}
                                  </span>
                                  <span className="ml-2">{addr.phone}</span>
                                </div>
                                {addr.isDefault && (
                                  <div className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                                    Mặc định
                                  </div>
                                )}
                              </label>
                              <p className="text-sm text-gray-500 mt-1">
                                {addr.street}, {addr.ward}, {addr.district},{" "}
                                {addr.city}, {addr.state}, {addr.country}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddressDialogOpen(false)}
                      >
                        Trở Lại
                      </Button>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => setIsAddressDialogOpen(false)}
                      >
                        Xác Nhận
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      + Thêm địa chỉ mới
                    </Button>
                  </>
                ) : (
                  <AddressForm></AddressForm>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
