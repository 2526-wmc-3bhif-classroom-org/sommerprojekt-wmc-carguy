export class ModelsService {
  protected static models = [
    // Porsche
    { brand: 'porsche', name: '911 Carrera', type: 'Sports', year: '2024' },
    { brand: 'porsche', name: 'Taycan', type: 'Electric', year: '2024' },
    { brand: 'porsche', name: 'Cayenne', type: 'SUV', year: '2024' },
    { brand: 'porsche', name: '718 Cayman', type: 'Sports', year: '2023' },
    { brand: 'porsche', name: 'Macan', type: 'Sports', year: '2024' },

    // BMW
    { brand: 'bmw', name: 'M3 Competition', type: 'Sedan', year: '2024' },
    { brand: 'bmw', name: 'i7', type: 'Electric', year: '2024' },
    { brand: 'bmw', name: 'X5 M', type: 'SUV', year: '2024' },
    { brand: 'bmw', name: 'M4 CSL', type: 'Coupe', year: '2023' },

    // Tesla
    { brand: 'tesla', name: 'Model S Plaid', type: 'Electric', year: '2024' },
    { brand: 'tesla', name: 'Model 3', type: 'Electric', year: '2024' },
    { brand: 'tesla', name: 'Cybertruck', type: 'Electric', year: '2024' },

    // Mercedes-Benz
    { brand: 'mercedes-benz', name: 'S-Class', type: 'Sedan', year: '2024' },
    { brand: 'mercedes-benz', name: 'G-Wagon', type: 'SUV', year: '2024' },
    { brand: 'mercedes-benz', name: 'AMG GT', type: 'Sports', year: '2024' },

    // Audi
    { brand: 'audi', name: 'RS6 Avant', type: 'Sports', year: '2024' },
    { brand: 'audi', name: 'e-tron GT', type: 'Electric', year: '2024' },
    { brand: 'audi', name: 'Q8', type: 'SUV', year: '2024' },

    // Ferrari
    { brand: 'ferrari', name: 'SF90 Stradale', type: 'Sports', year: '2024' },
    { brand: 'ferrari', name: 'Purosangue', type: 'SUV', year: '2024' },
    { brand: 'ferrari', name: '296 GTB', type: 'Sports', year: '2024' },

    // Lamborghini
    { brand: 'lamborghini', name: 'Revuelto', type: 'Sports', year: '2024' },
    { brand: 'lamborghini', name: 'Urus Performante', type: 'SUV', year: '2024' },

    // Toyota
    { brand: 'toyota', name: 'GR Supra', type: 'Sports', year: '2024' },
    { brand: 'toyota', name: 'Land Cruiser', type: 'SUV', year: '2024' },
    { brand: 'toyota', name: 'GR86', type: 'Sports', year: '2024' }
  ];

  static getModels(){
    return this.models;
  }
}
