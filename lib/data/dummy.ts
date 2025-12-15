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

export const DataNote = [
  {
    id: 1,
    title: "Follow up with client X",
    content: "Need to discuss new proposal with client X",
    date: "2025-12-14",
    time: "08:00",
  },
  {
    id: 2,
    title: "Follow up with client Y",
    content: "Need to discuss new proposal with client Y",
    date: "2025-12-24",
    time: "09:00",
  },
  {
    id: 3,
    title: "Follow up with client Z",
    content: "Need to discuss new proposal with client Z",
    date: "2025-12-09",
    time: "14:00",
  },
  {
    id: 4,
    title: "Follow up with client A",
    content: "Need to discuss new proposal with client A",
    date: "2025-12-10",
    time: "22:00",
  },
];
