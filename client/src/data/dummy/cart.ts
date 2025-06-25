import { CartShop, CartItem } from "@/lib/services/cart";

let dummyCart: CartShop[] = [
  {
    id: "shop-1",
    name: "TechStore",
    slug: "techstore",
    logo: "/logo/avatar.png",
    description: "Your one-stop shop for all tech gadgets and accessories",
    phoneNumber: "+1-555-123-4567",
    address: "123 Tech Street",
    detailedAddress: "123 Tech Street, Silicon Valley, CA 94000",
    userId: "user-1",
    products: [
      {
        _id: "1",
        title: "Wireless Bluetooth Headphones",
        price: 79.99,
        stock: 50,
        quantity: 1,
        thumbnail: "/products/ex_prod.png",
        variantId: "v1",
        category: "Electronics",
        variant: {
          name: "Color",
          value: "Black",
          price: 79.99,
        },
        variants: [
          {
            _id: "v1",
            name: "Color",
            value: "Black",
            price: 79.99,
            stock: 25,
            sku: "WBH-BLACK-001",
          },
          {
            _id: "v2",
            name: "Color",
            value: "White",
            price: 84.99,
            stock: 25,
            sku: "WBH-WHITE-001",
          },
        ],
        hasVariant: true,
        variantName: "Color",
        optionName: "Size",
      },
    ],
  },
];

export const getDummyCart = (): CartShop[] => {
  return JSON.parse(JSON.stringify(dummyCart));
};

export const addToCart = (
  productId: string,
  quantity: number,
  variantId?: string,
  shopId?: string
): void => {
  // Mock implementation - in real app this would add to cart
  console.log(`Added product ${productId} with quantity ${quantity} to cart`);
};

export const updateCartVariant = (
  productId: string,
  quantity: string,
  oldVariantId: string,
  newVariantId: string,
  shopId: string
): void => {
  // Mock implementation
  console.log(
    `Updated product ${productId} variant from ${oldVariantId} to ${newVariantId}`
  );
};

export const updateCartQuantity = (
  productId: string,
  quantity: number,
  shopId: string
): void => {
  // Mock implementation
  console.log(`Updated product ${productId} quantity to ${quantity}`);
};

export const removeFromCart = (
  productId: string,
  variantId: string,
  shopId: string
): void => {
  // Mock implementation
  console.log(
    `Removed product ${productId} with variant ${variantId} from cart`
  );
};
