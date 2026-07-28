import Brand from '@/components/Brand/Brand';
import Icon from '@/components/Icon/Icon';
import s from './AppFooter.module.css';

export default function AppFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div>
          <Brand />
          <p className={s.blurb}>
            Find your next race. Browse marathons, trail runs and city classics — then register in a couple of taps.
          </p>
        </div>
        <div className={s.col}>
          <h4>Contact</h4>
          <ul className={s.contact}>
            <li><Icon.phone aria-hidden="true" /> +1 (405) 732-5617</li>
            <li><Icon.mail aria-hidden="true" /> hello@nextrun.run</li>
            <li><Icon.pin aria-hidden="true" /> 98 Winn St, Woburn, MA 01801</li>
          </ul>
        </div>
      </div>
      <div className={s.bottom}>
        <span>© 2026 NEXTRUN. A learning project.</span>
        <span>Built from SPEC.md · light / ink</span>
      </div>
    </footer>
  );
}
