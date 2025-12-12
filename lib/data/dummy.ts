export const DataContact = [
  {
    id: 1,
    name: "Fadlan Satria",
    email: "satria.fadlan123@gmail.com",
    phone: "08123456789",
    posisi: "Marketing",
    company: "PT. Maju",
  },
  ...Array(7)
    .fill(null)
    .map((_, index) => ({
      id: index + 2,
      name: "Nama",
      email: "muhammad123@gmail.com",
      phone: "Telepon",
      posisi: "Posisi",
      company: "Owner",
    })),
];
