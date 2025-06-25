export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  COD_PENDING: 'cod_pending',
} as const;

export const SHIPPING_STATUS = {
  NOT_PACKED: 'not-packed',
  PACKED: 'packed',
  IN_TRANSIT: 'in-transit',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
  PROCESSING: 'processing',
  AWAITING_PICKUP: 'awaiting-pickup',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ thanh toán',
  [ORDER_STATUS.PAID]: 'Đã thanh toán',
  [ORDER_STATUS.SHIPPED]: 'Đã gửi hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.COD_PENDING]: 'Chờ thanh toán khi nhận hàng',
} as const;

export const SHIPPING_STATUS_LABELS = {
  [SHIPPING_STATUS.NOT_PACKED]: 'Chưa đóng gói',
  [SHIPPING_STATUS.PACKED]: 'Đã đóng gói',
  [SHIPPING_STATUS.IN_TRANSIT]: 'Đang vận chuyển',
  [SHIPPING_STATUS.OUT_FOR_DELIVERY]: 'Đang giao hàng',
  [SHIPPING_STATUS.DELIVERED]: 'Đã giao hàng',
  [SHIPPING_STATUS.PROCESSING]: 'Đang xử lý',
  [SHIPPING_STATUS.AWAITING_PICKUP]: 'Chờ lấy hàng',
  [SHIPPING_STATUS.RETURNED]: 'Đã hoàn trả',
  [SHIPPING_STATUS.CANCELLED]: 'Đã hủy',
} as const; 