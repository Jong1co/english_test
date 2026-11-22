'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type UIEvent } from 'react';

import { ActionButton } from '@/components/action-button';
import { CarouselDots } from '@/components/carousel-dots';
import { IconButton } from '@/components/icon-button';
import { Text } from '@/components/text';
import { situations, type SituationId } from '@/data/situations';
import { SituationCard } from '@/features/home/situation-card';

import styles from './home-screen.module.css';

const DOTS_GAP = 12;
const DOTS_HEIGHT = 6;
/** Least room between the dots and the Start button. */
const MIN_BOTTOM_GAP = 24;
/** On the 390×844 canvas the card is 500 tall; it keeps that share of the screen height. */
const CARD_HEIGHT_SHARE = 500 / 844;

export function HomeScreen() {
  const router = useRouter();
  const areaRef = useRef<HTMLDivElement>(null);
  // Measured in effects, never during render, so the server render and the first client render match.
  const [windowHeight, setWindowHeight] = useState(0);
  const [areaHeight, setAreaHeight] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const measure = () => setWindowHeight(window.innerHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => setAreaHeight(area.clientHeight));
    observer.observe(area);
    setAreaHeight(area.clientHeight);
    return () => observer.disconnect();
  }, []);

  // Cards keep the canvas's share of the screen height, but never push the dots into the Start button.
  const cardHeight = Math.max(
    0,
    Math.min(Math.round(windowHeight * CARD_HEIGHT_SHARE), areaHeight - DOTS_GAP - DOTS_HEIGHT - MIN_BOTTOM_GAP),
  );

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const [first, second] = [track.children[0], track.children[1]] as (HTMLElement | undefined)[];
    if (!first || !second) return;
    const step = second.offsetLeft - first.offsetLeft;
    const next = Math.round(track.scrollLeft / step);
    setIndex(Math.min(situations.length - 1, Math.max(0, next)));
  };

  const startPractice = (situationId: SituationId) => router.push(`/practice/${situationId}`);

  return (
    <main className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.greeting}>
          <Text as="h1" variant="headline-2">
            Hi, Jisoo
          </Text>
          <Text variant="subbody-2" tone="textSecondary">
            Where would you like to talk today?
          </Text>
        </div>
        <div className={styles.actions}>
          <IconButton icon="history" size="medium" iconColor="textSecondary" label="History" />
          <IconButton size="medium" label="Profile" className={styles.avatar}>
            <Text as="span" variant="button-2">
              J
            </Text>
          </IconButton>
        </div>
      </div>

      <div ref={areaRef} className={styles.carouselArea}>
        {cardHeight > 0 && (
          <>
            <div className={styles.track} role="group" aria-label="Situations" onScroll={onScroll}>
              {situations.map((situation) => (
                <SituationCard
                  key={situation.id}
                  situation={situation}
                  height={cardHeight}
                  onSelect={() => startPractice(situation.id)}
                />
              ))}
            </div>
            <div className={styles.dots}>
              <CarouselDots count={situations.length} index={index} />
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <ActionButton
          variant="fill-primary"
          label="Start"
          fullWidth
          onClick={() => startPractice(situations[index].id)}
        />
      </div>
    </main>
  );
}
