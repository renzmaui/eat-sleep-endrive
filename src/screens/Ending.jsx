import { useEffect, useState } from 'react';
import { byId, img, teamHashtag } from '../data';
import { rankEnchins } from '../lib/scoring';
import { Btn, Confetti, FanDisclaimer, Icon, SafeImg } from '../components/ui';
import { renderFinalCard, saveImage, shareText, shareToX } from '../lib/exportImage';
import { useCard } from '../lib/useCard';
import { sfx } from '../lib/sound';

export default function Ending({ playerName, results, driverId, onReplay, onReplayStory }) {
  const driver = byId(driverId);
  const ranked = rankEnchins(results);
  const [saving, setSaving] = useState(false);
  const [shareNote, setShareNote] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => sfx.fanfare(), []);
  const card = useCard(
    () => (driver ? renderFinalCard({ driverId: driver.id, playerName, ranked }) : null),
    [driver?.id, playerName, JSON.stringify(ranked)],
  );
  if (!driver) return null;

  const breakdown = [
    { k: 'Seating', v: results.mg1?.scores?.[driver.id] || 0 },
    { k: 'Quiz', v: results.mg2?.scores?.[driver.id] || 0 },
    { k: 'Style', v: results.mg3?.scores?.[driver.id] || 0 },
  ];
  const team = teamHashtag(driver);
  const filename = `endrive-chosen-driver-${driver.id}.png`;

  const onShare = async () => {
    sfx.pop();
    const r = await shareToX({ blob: card?.blob, filename, text: shareText(driver.id) });
    if (r === 'opened') setShareNote('Your photo was saved. Attach it to your post on X.');
    else if (r === 'blocked') setShareNote('Your browser blocked the pop-up. Allow pop-ups for this site, then try again.');
    else setShareNote('');
  };

  const onCopy = async () => {
    sfx.tap();
    try {
      await navigator.clipboard.writeText(shareText(driver.id));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setShareNote('Copy didn’t work here. Press and hold the caption to copy it.');
    }
  };

  return (
    <section className="page ending">
      <Confetti count={70} />
      <p className="eyebrow">MISSION 2 · THE CHOSEN ENCHIN DRIVER</p>
      <h1 className="page-title">
        Road trip done,
        <span> {playerName}!</span>
      </h1>
      <p className="page-sub">
        Your chosen Enchin driver is <strong>{driver.name}</strong>. Looks like you’re part of <strong>{team}</strong> now.
      </p>

      <section className="share-hero" style={{ '--c': driver.color }} aria-label="Share your chosen driver">
        <SafeImg src={img.flower(driver.id)} alt="" enchinId={driver.id} className="share-hero-flower" />
        <div className="share-hero-body">
          <span className="sb-label">SHARE YOUR FINAL CHOSEN DRIVER</span>
          <h2>
            My Mission 2 chosen driver is <span>{driver.name}</span>!
          </h2>
          <p className="share-preview">{shareText(driver.id)}</p>
          <div className="share-actions">
            <Btn variant="ink" size="lg" onClick={onShare} disabled={!card} sound={null}>
              <Icon.x /> Share to X
            </Btn>
            <Btn
              variant="soft"
              size="lg"
              disabled={!card || saving}
              onClick={async () => {
                setSaving(true);
                await saveImage({ blob: card.blob, filename });
                setSaving(false);
              }}
            >
              <Icon.save /> {saving ? 'Saving…' : 'Save image'}
            </Btn>
            <Btn variant="ghost" size="lg" onClick={onCopy} sound={null}>
              {copied ? 'Copied!' : 'Copy caption'}
            </Btn>
          </div>
          {shareNote && <p className="share-note">{shareNote}</p>}
        </div>
      </section>

      <div className="ending-grid">
        <figure className="ending-card">
          {card ? (
            <img src={card.url} alt={`Your chosen driver card: ${driver.name}, with the final standings`} />
          ) : (
            <div className="card-loading tall">Developing your photo…</div>
          )}
        </figure>

        <div className="ending-stats">
          <div className="sb-card">
            <span className="sb-label">HOW {driver.name.toUpperCase()} WON</span>
            <ul className="breakdown">
              {breakdown.map((b) => (
                <li key={b.k}>
                  <span>{b.k}</span>
                  <strong>+{b.v}</strong>
                </li>
              ))}
              <li className="total">
                <span>Total</span>
                <strong>{ranked.find((r) => r.id === driver.id)?.points}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="action-buttons center wrap ending-actions">
        <Btn variant="ghost" onClick={onReplayStory} sound={null}>
          <Icon.play width="16" height="16" /> Watch the story again
        </Btn>
        <Btn variant="primary" onClick={onReplay}>
          <Icon.restart /> Play again
        </Btn>
      </div>

      <Teaser driver={driver} />

      <FanDisclaimer className="on-ending" />
    </section>
  );
}

function Teaser({ driver }) {
  return (
    <aside className="teaser" aria-label="What comes next">
      <div className="teaser-garage" aria-hidden="true">
        <div className="teaser-light" />
        <div className="teaser-car">
          <SafeImg src={img.car(driver.id)} alt="" />
          <span className="teaser-tarp" />
        </div>
        <div className="teaser-door" />
      </div>
      <div className="teaser-copy">
        <p className="teaser-kicker">
          <span className="rec" /> SIGNAL FOUND · E1 GARAGE
        </p>
        <h2>The road doesn’t end here.</h2>
        <p>
          Papa {driver.papa}’s helmet is still warm. The tarp is still half off. And somewhere past the checkered flags, the Papas are waiting. ENHYPEN is waiting.
        </p>
        <p className="teaser-q">A car to rebuild? A race to win? A reunion?</p>
        <p className="teaser-tag">NEXT ON THE E1 ROAD · STAY TUNED, ENGENE</p>
      </div>
    </aside>
  );
}
