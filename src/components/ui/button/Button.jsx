import './Button.css';

const variants = {
	primary: 'btn btn--primary',
	secondary: 'btn btn--secondary',
	ghost: 'btn btn--ghost',
	outline: 'btn btn--outline',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
	const classes = `${variants[variant] || variants.primary} ${className}`.trim();
	return <button className={classes} {...props} />;
}
