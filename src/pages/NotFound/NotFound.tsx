import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader/PageHeader';
import Icon from '@/components/Icon/Icon';
import s from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className={s.page}>
      <div className={s.container}>
        <PageHeader label="Error" />
        <div className={s.nf}>
          <p className={s.code}>404</p>
          <h1 className={s.title}>Error <em>Page</em></h1>
          <p className={s.text}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <button className={s.cta} onClick={() => navigate('/')}>
            <Icon.back aria-hidden="true" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
