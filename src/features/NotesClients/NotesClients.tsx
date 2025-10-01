import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import CryptoJS from 'crypto-js';

import styles from './NotesClients.module.scss';
import { Button, Textarea } from '@shared/ui';
import { schema } from './NotesClients.validations';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CLIENTS_NOTE_FIELDS,
  INotesClientProps,
} from './NotesClients.types.ts';
import cn from 'classnames';
import { useNote } from '@store/note.ts';
import { format, isSameDay, parseISO } from 'date-fns';
import { encodeDecodeSecretKey } from '@utils/helpers.ts';

export type FormData = yup.InferType<typeof schema>;

const NotesClients: React.FC<INotesClientProps> = (props) => {
  const { clientUuid } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState<string>('');
  const [notesData, setNotesData] = useState<any[]>([]);
  const getNotes = useNote((state) => state.getNotes);
  const notes = useNote((state) => state.notes);
  const editNote = useNote((state) => state.editNote);
  const deleteNote = useNote((state) => state.deleteNote);
  const createNote = useNote((state) => state.createNote);

  const {
    setValue,
    reset,
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditedNote(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await createNote(
        {
          note: CryptoJS.AES.encrypt(
            data?.newNote,
            encodeDecodeSecretKey,
          ).toString(),
        },
        clientUuid,
      );
      await getNotes(clientUuid);
      reset();
    } catch (err) {
      console.log('error', err);
    }
  };

  const onEditNote = (index: number) => {
    if (
      editedNote ===
      CryptoJS.AES.decrypt(
        notesData?.[index]?.note,
        encodeDecodeSecretKey,
      ).toString(CryptoJS.enc.Utf8)
    ) {
      setEditingIndex(null);
      setEditedNote('');
    } else {
      setEditingIndex(index);
      setEditedNote(
        CryptoJS.AES.decrypt(
          notesData?.[index]?.note,
          encodeDecodeSecretKey,
        ).toString(CryptoJS.enc.Utf8),
      );
      setValue('notesText', notesData?.[index]?.text);
    }
  };

  const onSaveEditedNote = async (id: number) => {
    try {
      if (editedNote) {
        await editNote(
          {
            note: CryptoJS.AES.encrypt(
              editedNote,
              encodeDecodeSecretKey,
            ).toString(),
          },
          id,
        );
        await getNotes(clientUuid);
      } else {
        await deleteNote(id);
        await getNotes(clientUuid);
      }
      setEditingIndex(null);
      setEditedNote('');
    } catch (err) {
      console.log('error', err);
    }
  };

  const getNotesData = async () => {
    try {
      await getNotes(clientUuid);
    } catch (err) {
      console.log('error', err);
    }
  };

  const displayFormattedText = (text: string) => {
    const decryptedText = CryptoJS.AES.decrypt(
      text,
      encodeDecodeSecretKey,
    ).toString(CryptoJS.enc.Utf8);
    return decryptedText
      .split('\n')
      .map((line, index) => (
        <p key={index}>{line.trim() === '' ? '\u00A0' : line}</p>
      ));
  };

  useEffect(() => {
    getNotesData();
  }, [clientUuid]);

  useEffect(() => {
    setNotesData(notes);
  }, [notes]);

  useEffect(() => {
    if (editingIndex !== null) {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          textareaRef.current.value.length;
      }
      adjustTextareaHeight();
    }
  }, [editingIndex]);

  const newNote = watch(CLIENTS_NOTE_FIELDS.NEW_NOTE);

  return (
    <div className={styles.notesWrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.newNoteWrapper}>
          <Textarea
            placeholder="Write a note"
            className={styles.newTextarea}
            {...register(CLIENTS_NOTE_FIELDS.NEW_NOTE)}
            errorMessage={errors[CLIENTS_NOTE_FIELDS.NEW_NOTE]?.message}
          />
          <div className={styles.saveButtonWrapper}>
            <Button
              variant={newNote ? 'primary' : 'secondary'}
              type="submit"
              label={'Save'}
            />
          </div>
        </div>
        <div>
          {notesData?.map((item: any, index: number) => {
            const currentDate = parseISO(item.createdAt);
            const prevDate =
              index > 0 ? parseISO(notesData[index - 1].createdAt) : null;
            const shouldPrintDate =
              !prevDate || !isSameDay(currentDate, prevDate);

            return (
              <div key={index} className={styles.noteBlock}>
                <div className={styles.row}>
                  {shouldPrintDate && (
                    <span className={styles.date}>
                      {format(currentDate, 'MMMM do')}
                    </span>
                  )}
                  {editingIndex === index && (
                    <span
                      className={cn(styles.closeWrapper)}
                      onClick={() => {
                        setEditedNote('');
                        setEditingIndex(null);
                      }}
                    >
                      <i className={cn('icon-plus', styles.iconClose)} />
                    </span>
                  )}
                  <span
                    className={cn(styles.editWrapper, {
                      [styles.checkWrapper]: editingIndex === index,
                      [styles.disabled]:
                        editedNote ===
                        CryptoJS.AES.decrypt(
                          notesData?.[index]?.note,
                          encodeDecodeSecretKey,
                        ).toString(CryptoJS.enc.Utf8),
                    })}
                    onClick={() => {
                      editingIndex === index &&
                      !(
                        editedNote ===
                        CryptoJS.AES.decrypt(
                          notesData?.[index]?.note,
                          encodeDecodeSecretKey,
                        ).toString(CryptoJS.enc.Utf8)
                      )
                        ? onSaveEditedNote(item?.id)
                        : onEditNote(index);
                    }}
                  >
                    <i
                      className={cn(
                        editingIndex === index ? 'icon-check' : 'icon-edit',
                      )}
                    />
                  </span>
                </div>
                {editingIndex === index ? (
                  <Textarea
                    className={styles.noteTextarea}
                    {...register(
                      `${CLIENTS_NOTE_FIELDS.NOTES_TEXT}.${index}.text`,
                    )}
                    errorMessage={
                      errors[CLIENTS_NOTE_FIELDS.NOTES_TEXT]?.[index]?.text
                        ?.message
                    }
                    defaultValue={CryptoJS.AES.decrypt(
                      notesData?.[index]?.note,
                      encodeDecodeSecretKey,
                    ).toString(CryptoJS.enc.Utf8)}
                    ref={textareaRef}
                    onInput={handleInput}
                  />
                ) : (
                  <div className={styles.noteWrapper}>
                    <span className={styles.note}>
                      {displayFormattedText(item?.note)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </form>
      <div className={styles.infoTextWrapper}>
        <span>Notes are encrypted, not even Offload can see them.</span>
      </div>
    </div>
  );
};
export default NotesClients;
