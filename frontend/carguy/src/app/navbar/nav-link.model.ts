export interface NavLink {
  label: string;      // The text the user sees
  path: string;       // The route (e.g., '/dashboard')
  icon?: string;      // Optional: for Material Icons or FontAwesome
  disabled?: boolean; // Optional: to gray out a link
}
