export interface PaymentSettings {
  whatsappNumber: string;
  pixKey: string;
  /** Base64 data URL ou URL pública da imagem do QR Code PIX */
  pixQrCode: string;
}
