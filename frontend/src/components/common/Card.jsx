export default function Card({ children, className = "" }) {
    return (
      <div
        className={`rounded-[24px] border border-[#eadfcb] bg-white p-5 shadow-sm ${className}`}
      >
        {children}
      </div>
    );
  }