export function getBrandColor(name: string): string {
  const brandColors: { [key: string]: string } = {
    'ferrari': '#D61F27',
    'lamborghini': '#D4AF37',
    'porsche': '#222222',
    'bmw': '#1C69D4',
    'audi': '#333333',
    'mercedes': '#555555',
    'ford': '#003399',
    'chevrolet': '#E0A800',
    'toyota': '#EB0A1E',
    'honda': '#E4002B',
    'nissan': '#C3002F',
    'mazda': '#E60012',
    'subaru': '#0033A0',
    'mitsubishi': '#E60012',
  };
  
  const key = name.toLowerCase();
  for (const [brand, color] of Object.entries(brandColors)) {
    if (key.includes(brand)) {
      return color;
    }
  }
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
