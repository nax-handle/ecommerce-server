import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounce } from "use-debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { provinces } from "@/lib/constants/location";
export interface Address {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  country: string;
  latitude: string;
  longitude: string;
  note: string;
  city: string;
  isDefault: boolean;
}

const addressSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50),
  phone: z.string().regex(/^\+?\d{9,11}$/, "Số điện thoại không hợp lệ"),
  street: z.string().min(1, "Vui lòng nhập địa chỉ cụ thể"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  country: z.string().min(1),
  state: z.string().min(1, "Vui lòng nhập tỉnh/bang"),
  latitude: z.string().min(0),
  longitude: z.string().min(0),
  note: z.string().min(1, "Vui lòng nhập ghi chú"),
  city: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  isDefault: z.boolean().default(false),
});

export function AddressForm() {
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "Vietnam",
      latitude: "",
      longitude: "",
      note: "",
      isDefault: false,
    },
  });

  const [provinceSearch, setProvinceSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [debouncedProvince] = useDebounce(provinceSearch, 300);
  const [debouncedDistrict] = useDebounce(districtSearch, 300);
  const [debouncedWard] = useDebounce(wardSearch, 300);
  const selectedProvince = provinces.find((p) => p.Code === form.watch("city"));
  const selectedDistrict = selectedProvince?.District.find(
    (d) => d.Code === form.watch("district")
  );
  const selectedWard = selectedDistrict?.Ward
    ? selectedDistrict.Ward.find((w) => w.Code === form.watch("ward"))
    : [];

  const filteredProvinces = provinces.filter((p) =>
    p.FullName.toLowerCase().includes(debouncedProvince.toLowerCase())
  );

  const filteredDistricts = selectedProvince
    ? selectedProvince.District.filter((d) =>
        d.FullName.toLowerCase().includes(debouncedDistrict.toLowerCase())
      )
    : [];

  const filteredWards = selectedDistrict?.Ward
    ? selectedDistrict.Ward.filter((w) =>
        w.FullName.toLowerCase().includes(debouncedWard.toLowerCase())
      )
    : [];

  const handleSubmit = (data: Address) => {
    console.log("Form submitted:", data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Nhập họ tên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input số điện thoại */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Nhập số điện thoại" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input địa chỉ cụ thể */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ cụ thể</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Nhập số nhà, đường phố"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={() => (
            <FormItem>
              <FormLabel>Tỉnh/Thành phố</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedProvince?.FullName || "Chọn tỉnh/thành phố"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 max-h-60 overflow-y-auto">
                  <Command>
                    <CommandInput
                      placeholder="Tìm tỉnh/thành phố..."
                      value={provinceSearch}
                      onValueChange={setProvinceSearch}
                    />
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                    <CommandGroup>
                      {filteredProvinces.map((province) => (
                        <CommandItem
                          key={province.Code}
                          value={province.Code}
                          onSelect={() => {
                            form.setValue("city", province.Code);
                            form.setValue("district", "");
                            form.setValue("ward", "");
                            setProvinceSearch("");
                          }}
                        >
                          {province.FullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="district"
          render={() => (
            <FormItem>
              <FormLabel>Quận/Huyện</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!selectedProvince}
                    >
                      {selectedDistrict?.FullName || "Chọn quận/huyện"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 max-h-60 overflow-y-auto">
                  <Command>
                    <CommandInput
                      placeholder="Tìm quận/huyện..."
                      value={districtSearch}
                      onValueChange={setDistrictSearch}
                    />
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                    <CommandGroup>
                      {filteredDistricts.map((district) => (
                        <CommandItem
                          key={district.Code}
                          value={district.Code}
                          onSelect={() => {
                            form.setValue("district", district.Code);
                            form.setValue("ward", "");
                            setDistrictSearch("");
                          }}
                        >
                          {district.FullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trường phường/xã */}
        <FormField
          control={form.control}
          name="ward"
          render={() => (
            <FormItem>
              <FormLabel>Phường/Xã</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!selectedDistrict}
                    >
                      {selectedWard?.FullName || "Chọn phường/xã"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 max-h-60 overflow-y-auto">
                  <Command>
                    <CommandInput
                      placeholder="Tìm phường/xã..."
                      value={wardSearch}
                      onValueChange={setWardSearch}
                    />
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                    <CommandGroup>
                      {filteredWards.map((ward) => (
                        <CommandItem
                          key={ward.Code}
                          value={ward.Code}
                          onSelect={() => {
                            form.setValue("ward", ward.Code);
                            setWardSearch("");
                          }}
                        >
                          {ward.FullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quốc gia</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Nhập quốc gia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Input
                  className="textarea textarea-bordered w-full"
                  placeholder="Nhập ghi chú"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="col-span-1 md:col-span-2">
          Submit
        </Button>
      </form>
    </Form>
  );
}
