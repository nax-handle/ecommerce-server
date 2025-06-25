// "use client";

// import { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, MapPin, Pencil, Trash2, Search } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   provinces,
//   type Province,
//   type District,
//   type Ward,
//   searchProvinces,
// } from "@/lib/constants/location";

// const addressFormSchema = z.object({
//   fullName: z
//     .string()
//     .min(2, "Họ tên phải có ít nhất 2 ký tự")
//     .max(50, "Họ tên không được vượt quá 50 ký tự"),
//   phone: z
//     .string()
//     .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
//   province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
//   district: z.string().min(1, "Vui lòng chọn quận/huyện"),
//   ward: z.string().min(1, "Vui lòng chọn phường/xã"),
//   street: z.string().min(1, "Vui lòng nhập địa chỉ cụ thể"),
//   isDefault: z.boolean().default(false),
// });

// type AddressFormValues = z.infer<typeof addressFormSchema>;

// interface Address {
//   id: number;
//   fullName: string;
//   phone: string;
//   province: string;
//   district: string;
//   ward: string;
//   street: string;
//   isDefault: boolean;
// }

// const mockAddresses: Address[] = [
//   {
//     id: 1,
//     fullName: "Nguyễn Văn A",
//     phone: "0123456789",
//     province: "Hồ Chí Minh",
//     district: "Quận 1",
//     ward: "Phường Bến Nghé",
//     street: "123 Đường Lê Lợi",
//     isDefault: true,
//   },
//   {
//     id: 2,
//     fullName: "Nguyễn Văn B",
//     phone: "0987654321",
//     province: "Hà Nội",
//     district: "Quận Ba Đình",
//     ward: "Phường Điện Biên",
//     street: "45 Đường Phan Đình Phùng",
//     isDefault: false,
//   },
// ];

// export default function AddressesPage() {
//   const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<Address | null>(null);
//   const [selectedProvince, setSelectedProvince] = useState<Province | null>(
//     null
//   );
//   const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
//     null
//   );
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredProvinces, setFilteredProvinces] =
//     useState<Province[]>(provinces);

//   const form = useForm<AddressFormValues>({
//     resolver: zodResolver(addressFormSchema),
//     defaultValues: {
//       fullName: "",
//       phone: "",
//       province: "",
//       district: "",
//       ward: "",
//       street: "",
//       isDefault: false,
//     },
//   });

//   function onSubmit(data: AddressFormValues) {
//     if (editingAddress) {
//       setAddresses(
//         addresses.map((addr) =>
//           addr.id === editingAddress.id ? { ...data, id: addr.id } : addr
//         )
//       );
//     } else {
//       setAddresses([...addresses, { ...data, id: Date.now() }]);
//     }
//     setIsDialogOpen(false);
//     form.reset();
//     setEditingAddress(null);
//     setSelectedProvince(null);
//     setSelectedDistrict(null);
//   }

//   function handleEdit(address: Address) {
//     setEditingAddress(address);
//     form.reset(address);
//     const province = provinces.find((p) => p.name === address.province);
//     if (province) {
//       setSelectedProvince(province);
//       const district = province.districts.find(
//         (d) => d.name === address.district
//       );
//       if (district) {
//         setSelectedDistrict(district);
//       }
//     }
//     setIsDialogOpen(true);
//   }

//   function handleDelete(id: number) {
//     setAddresses(addresses.filter((addr) => addr.id !== id));
//   }

//   function handleSetDefault(id: number) {
//     setAddresses(
//       addresses.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === id,
//       }))
//     );
//   }

//   function handleProvinceChange(provinceId: string) {
//     const province = provinces.find((p) => p.id === provinceId);
//     setSelectedProvince(province || null);
//     setSelectedDistrict(null);
//     form.setValue("district", "");
//     form.setValue("ward", "");
//   }

//   function handleDistrictChange(districtId: string) {
//     if (!selectedProvince) return;
//     const district = selectedProvince.districts.find(
//       (d) => d.id === districtId
//     );
//     setSelectedDistrict(district || null);
//     form.setValue("ward", "");
//   }

//   function handleSearch(query: string) {
//     setSearchQuery(query);
//     setFilteredProvinces(searchProvinces(query));
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Sổ địa chỉ</CardTitle>
//               <CardDescription>
//                 Quản lý địa chỉ giao hàng của bạn
//               </CardDescription>
//             </div>
//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button
//                   onClick={() => {
//                     form.reset();
//                     setEditingAddress(null);
//                     setSelectedProvince(null);
//                     setSelectedDistrict(null);
//                   }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Thêm địa chỉ mới
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                   <DialogTitle>
//                     {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
//                   </DialogTitle>
//                 </DialogHeader>
//                 <Form {...form}>
//                   <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className="space-y-4"
//                   >
//                     <FormField
//                       control={form.control}
//                       name="fullName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Họ và tên</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Nhập họ và tên" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="phone"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Số điện thoại</FormLabel>
//                           <FormControl>
//                             <Input placeholder="0123456789" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="relative">
//                       <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
//                       <Input
//                         placeholder="Tìm kiếm tỉnh/thành phố, quận/huyện, phường/xã..."
//                         value={searchQuery}
//                         onChange={(e) => handleSearch(e.target.value)}
//                         className="pl-9"
//                       />
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="province"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Tỉnh/Thành phố</FormLabel>
//                           <Select
//                             onValueChange={(value) => {
//                               field.onChange(value);
//                               handleProvinceChange(value);
//                             }}
//                             value={field.value}
//                           >
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Chọn tỉnh/thành phố" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               {filteredProvinces.map((province) => (
//                                 <SelectItem
//                                   key={province.id}
//                                   value={province.id}
//                                 >
//                                   {province.name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="district"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Quận/Huyện</FormLabel>
//                           <Select
//                             onValueChange={(value) => {
//                               field.onChange(value);
//                               handleDistrictChange(value);
//                             }}
//                             value={field.value}
//                             disabled={!selectedProvince}
//                           >
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Chọn quận/huyện" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               {selectedProvince?.districts.map((district) => (
//                                 <SelectItem
//                                   key={district.id}
//                                   value={district.id}
//                                 >
//                                   {district.name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="ward"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Phường/Xã</FormLabel>
//                           <Select
//                             onValueChange={field.onChange}
//                             value={field.value}
//                             disabled={!selectedDistrict}
//                           >
//                             <FormControl>
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Chọn phường/xã" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               {selectedDistrict?.wards.map((ward) => (
//                                 <SelectItem key={ward.id} value={ward.id}>
//                                   {ward.name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="street"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Địa chỉ cụ thể</FormLabel>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Số nhà, tên đường..."
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <Button type="submit" className="w-full">
//                       {editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
//                     </Button>
//                   </form>
//                 </Form>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {addresses.map((address) => (
//               <div
//                 key={address.id}
//                 className="flex items-start justify-between border rounded-lg p-4"
//               >
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2">
//                     <MapPin className="h-4 w-4 text-gray-500" />
//                     <span className="font-medium">{address.fullName}</span>
//                     <span className="text-gray-500">|</span>
//                     <span className="text-gray-500">{address.phone}</span>
//                     {address.isDefault && (
//                       <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
//                         Mặc định
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-600">
//                     {address.street}, {address.ward}, {address.district},{" "}
//                     {address.province}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {!address.isDefault && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleSetDefault(address.id)}
//                     >
//                       Đặt mặc định
//                     </Button>
//                   )}
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleEdit(address)}
//                   >
//                     <Pencil className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDelete(address.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
