import { Link } from 'react-router-dom';
import s from './Brand.module.css';

export default function Brand() {
  return (
    <Link to="/" className={s.brand}>
      <span className={s.mark} role="img" aria-label="NEXTRUN logo" />
      <span className={s.name}>NEXTRUN<b>.</b></span>
    </Link>
  );
}
