type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <button className="toast" type="button" onClick={onDismiss}>
      {message}
    </button>
  );
}
