export interface Order {
  id: string;
  productImage: any;
  productName: string;
  orderDate: string;
  status: 'En attente' | 'Livrée' | 'Annulée';
  total: number;
  devise: string;
  deliveryAddress: string;
}
