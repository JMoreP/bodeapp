import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    priceUsd: 15.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv0-5i2cRpuaHJzh4HqPvHKK9AHyUkmb_Z-qgP3lkUrZB5UA1_0G1Dn_aEVtD9AhMbxdCaTap4YLlSUVahXlrd9mwcdETnWj1wt-KaOL4OIZ-YWYNvU_KMaeSeSsrS5EBGTt2wjbyXxusNDf1LpGogTyY537Itun8tFlUEqGcJ1BtvxbnICrDc1-E0KmJbVjR6OXMs1pj2J1V-X6YIc9F6aVhy0q2IC9lweVZqDMaY8ZvoyTl3vfCtRQskv4JxZksBUffBIgb0S9A',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    sku: 'KB-204',
    priceUsd: 85.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwfpTayzRa_NNVeiRttoJeX89WVZ_bNslimeKPsjCWH1BJ28NnkysPWfZ3lKx4f0TFR_eyTROS-bQauaBMb99OhE1mVMsCKDj_J-clMGFR6RRrUOOZqp4co_HSkNH29Kl66RI9egoEKIgyA_ynxPGV7ZrUDOL5xpfMf07-9yhtGdr_R_Q_O3nhccZP-r_0cYpbMafJMZpj7KNSIkdhqbsgW9-UvcD9aZTwbcGG1eozd2dX7ZLLBDl5Hyq5Uz8WmJBLTBZN6dNahRg',
    quantity: 2,
  },
  {
    id: '3',
    name: '27-inch Monitor',
    sku: 'MN-440',
    priceUsd: 220.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqqXAZSA6XdUueSCr_0UHEXfyKMuErl_D79UFoer-6p8Q67Z_chua5Nj1hFSBX2-QXqVs6fqPDehEGOqiIxNAXtsbn1i0JPuVcLyNMJ0FWUCMsbZtjWfA44JozfY37nO4uRHxWYPyV36wvdos794mUlptR-Xm5Kmuk11tO6rNDY0K74bELHF8Ojp-tJnLaJlefmO_Lzuvq_d5wEtwPKEqfSL_kOJ5uytcvrM3qorydI9dFOVdFQJDxTHa_ND2jne-NsZTx3C-HkaE',
    quantity: 1,
  },
  {
    id: '4',
    name: 'USB-C Hub',
    sku: 'AC-112',
    priceUsd: 45.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClhOx6eKHYexSY2-K4H_ljqI6-1u9_JjEFmv1rW-dk9j5kh8lBhGCM8FB91xs_KKedCJan9gGyZqBwn0hx-gSSLbGwF_ApgYWBhV-NZCBqQute1nCmKwfgTOxWLakEn-ZvPICrSAZ8DrvFZ7iC9F-YVV6VxN3dIJsgSac_4ZPtf2vZvI9OEndLywJmGMhauZzzPEFTwumHhmiLTOTOxVLw85ruQzkVLLvSWhl_nqjzG4bFN2Pg-U3YwouiuZd2MredFhV7KSfDFr4',
    quantity: 0,
  }
];

export const INITIAL_EXCHANGE_RATE = 36.50;
