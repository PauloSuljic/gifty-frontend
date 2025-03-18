interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`p-5 rounded-lg shadow-lg bg-white/10 backdrop-blur-lg border border-white/20 transition hover:scale-105 hover:border-white/40 ${className}`}>
      {children}
    </div>
  );
};

export default Card;