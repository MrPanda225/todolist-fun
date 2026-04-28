import React, { useState, useEffect, useRef } from 'react';
import { X, Zap }                             from 'lucide-react';
import { useQuery }                            from '@tanstack/react-query';
import { categoriesApi }                       from '../../api/categories.api';
import { usePriorities }                       from '../../hooks/usePriorities';
import type { CreateTaskPayload }              from '../../types/task.types';
import { colors, radius }                      from '../../styles/tokens';

interface CreateTaskPanelProps {
  isOpen:     boolean;
  onClose:    () => void;
  onCreate:   (payload: CreateTaskPayload) => Promise<void>;
  isCreating: boolean;
}

const INITIAL_FORM = {
  title:       '',
  description: '',
  xpReward:    50,
  dueDate:     '',
  priorityId:  '',
  categoryId:  '',
};

export function CreateTaskPanel({
  isOpen, onClose, onCreate, isCreating,
}: CreateTaskPanelProps) {
  const [form, setForm]   = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const titleRef          = useRef<HTMLInputElement>(null);

  const { data: priorities = [] } = usePriorities();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.getAll().then(r => r.data),
  });

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError('');
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function updateField<K extends keyof typeof INITIAL_FORM>(
    field: K,
    value: typeof INITIAL_FORM[K],
  ) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Le titre est requis');
      return;
    }
    setError('');
    try {
      await onCreate({
        title:       form.title.trim(),
        description: form.description || undefined,
        xpReward:    form.xpReward,
        dueDate:     form.dueDate     || undefined,
        priorityId:  form.priorityId  || undefined,
        categoryId:  form.categoryId  || undefined,
      });
      onClose();
    } catch {
      setError('Erreur lors de la création');
    }
  }

  return (
    <>
      {isOpen && <div onClick={onClose} style={styles.overlay} />}

      <div style={{
        ...styles.panel,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Nouvelle tâche</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Fermer">
            <X size={20} color={colors.muted} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Titre *</label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Ex: Réviser le chapitre 3"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Détails optionnels..."
              rows={3}
              style={{ ...styles.input, resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Priorité</label>
              <select
                value={form.priorityId}
                onChange={e => updateField('priorityId', e.target.value)}
                style={styles.select}
              >
                <option value="">Aucune</option>
                {priorities
                  .slice()
                  .sort((a, b) => b.level - a.level)
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
              </select>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Catégorie</label>
              <select
                value={form.categoryId}
                onChange={e => updateField('categoryId', e.target.value)}
                style={styles.select}
              >
                <option value="">Aucune</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Date d'échéance</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => updateField('dueDate', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>
                <Zap size={12} style={{ marginRight: 4, display: 'inline' }} />
                XP reward
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.xpReward}
                onChange={e => updateField('xpReward', Number(e.target.value))}
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            style={{ ...styles.submitBtn, opacity: isCreating ? 0.7 : 1 }}
          >
            {isCreating ? 'Création...' : 'Créer la tâche'}
          </button>
        </form>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position:   'fixed',
    inset:      0,
    background: 'rgba(13,31,51,0.3)',
    zIndex:     40,
  },
  panel: {
    position:      'fixed',
    top:           0,
    right:         0,
    bottom:        0,
    width:         420,
    maxWidth:      '100vw',
    background:    colors.white,
    boxShadow:     '-4px 0 24px rgba(13,31,51,0.12)',
    zIndex:        50,
    display:       'flex',
    flexDirection: 'column',
    transition:    'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    overflowY:     'auto',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '20px 24px',
    borderBottom:   `1px solid ${colors.border}`,
    position:       'sticky',
    top:            0,
    background:     colors.white,
    zIndex:         1,
    flexShrink:     0,
  },
  headerTitle: {
    fontSize:   18,
    fontWeight: 700,
    color:      colors.dark,
    margin:     0,
  },
  closeBtn: {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    padding:      6,
    borderRadius: 8,
    display:      'flex',
    alignItems:   'center',
  },
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    padding:       24,
    flex:          1,
  },
  errorBox: {
    padding:      '10px 14px',
    background:   '#fef2f2',
    border:       '1px solid #fecaca',
    borderRadius: radius.sm,
    fontSize:     13,
    color:        '#c0392b',
  },
  field: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  row: {
    display: 'flex',
    gap:     12,
  },
  label: {
    fontSize:   13,
    fontWeight: 600,
    color:      colors.dark,
    display:    'flex',
    alignItems: 'center',
  },
  input: {
    padding:      '10px 12px',
    border:       `1.5px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize:     14,
    color:        colors.dark,
    background:   colors.white,
    outline:      'none',
    fontFamily:   'inherit',
    width:        '100%',
    boxSizing:    'border-box',
  },
  select: {
    padding:      '10px 12px',
    border:       `1.5px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize:     14,
    color:        colors.dark,
    background:   colors.white,
    outline:      'none',
    fontFamily:   'inherit',
    width:        '100%',
    cursor:       'pointer',
    boxSizing:    'border-box',
  },
  submitBtn: {
    padding:      '13px',
    background:   colors.primary,
    color:        'white',
    border:       'none',
    borderRadius: radius.md,
    fontSize:     15,
    fontWeight:   600,
    cursor:       'pointer',
    marginTop:    'auto',
    fontFamily:   'inherit',
    transition:   'background 0.2s',
  },
};