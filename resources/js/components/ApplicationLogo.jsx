export default function ApplicationLogo(props) {
    return (
        <img {...props} src="/logo.png" alt="Puréva Logo" style={{ objectFit: 'contain' }} />
    );
}
