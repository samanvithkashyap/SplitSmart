import './Card.css';

export default function Card({ title, value, children, accent = false, footer }) {
  return (
    <div className={`card ${accent ? 'card--accent' : ''}`}>
      {title && <p className="card__title">{title}</p>}
      {value && <p className="card__value">{value}</p>}
      {children}
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}
