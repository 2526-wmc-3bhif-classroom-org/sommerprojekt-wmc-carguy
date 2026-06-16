export function openImageModal(url: string, event: Event): string {
  event.stopPropagation();
  event.preventDefault();
  const modal = document.getElementById('image_modal') as HTMLDialogElement;
  if (modal) {
    modal.showModal();
  }
  return url;
}

export function scrollToSlide(id: string): void {
  const el = document.getElementById(id);
  if (el) {
    el.parentElement?.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
  }
}
