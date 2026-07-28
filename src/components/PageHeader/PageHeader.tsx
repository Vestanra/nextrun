import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon/Icon';
import s from './PageHeader.module.css';

interface Props {
  label: string;
  showBack?: boolean;
}

export default function PageHeader({ label, showBack = true }: Props) {
  const navigate = useNavigate();
  return (
    <div className={s.head}>
      <span className={s.label}>{label}</span>
      {showBack && (
        <button className={s.backBtn} onClick={() => navigate('/')}>
          <Icon.back aria-hidden="true" /> Back
        </button>
      )}
    </div>
  );
}
