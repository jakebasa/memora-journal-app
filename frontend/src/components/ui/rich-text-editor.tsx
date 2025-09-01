import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content || '';
        }
    }, [content]);

    // Add class to show placeholder when empty
    useEffect(() => {
        if (editorRef.current) {
            const isEmpty =
                !editorRef.current.innerHTML ||
                editorRef.current.innerHTML === '<br>' ||
                editorRef.current.innerHTML === '<div><br></div>' ||
                editorRef.current.innerHTML.trim() === '';

            if (isEmpty) {
                editorRef.current.classList.add('is-empty');
            } else {
                editorRef.current.classList.remove('is-empty');
            }
        }
    }, [content]);

    const handleInput = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
            // Check if content is empty and update the is-empty class
            const isEmpty =
                !content ||
                content === '<br>' ||
                content === '<div><br></div>' ||
                content.trim() === '';
            if (isEmpty) {
                editorRef.current.classList.add('is-empty');
            } else {
                editorRef.current.classList.remove('is-empty');
            }
        }
    };

    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const formatButtons = [
        { command: 'bold', icon: Bold, label: 'Bold' },
        { command: 'italic', icon: Italic, label: 'Italic' },
        { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
        {
            command: 'insertOrderedList',
            icon: ListOrdered,
            label: 'Numbered List',
        },
        {
            command: 'formatBlock',
            icon: Quote,
            label: 'Quote',
            value: 'blockquote',
        },
    ];

    return (
        <div className='border border-border rounded-lg shadow-soft overflow-hidden'>
            {/* Toolbar */}
            <div className='flex items-center gap-1 p-3 border-b border-border bg-muted/30'>
                {formatButtons.map(({ command, icon: Icon, label, value }) => (
                    <Button
                        key={command}
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => executeCommand(command, value)}
                        className='h-8 w-8'
                        title={label}
                    >
                        <Icon className='h-3 w-3' />
                    </Button>
                ))}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className={`
          relative min-h-[300px] p-4 bg-background text-foreground outline-none
          editor-content custom-scroll prose prose-sm
          ${isFocused ? 'ring-2 ring-ring/20' : ''}
        `}
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-placeholder={placeholder}
                style={{
                    wordBreak: 'break-word',
                }}
                suppressContentEditableWarning={true}
            />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
          [contenteditable][data-placeholder].is-empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            position: absolute;
            pointer-events: none;
            display: block;
            left: 1rem;
            right: 1rem;
            top: 1rem;
          }
          .editor-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }
          .editor-content ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }
          .editor-content blockquote {
            border-left: 4px solid hsl(var(--muted-foreground));
            padding-left: 1rem;
            color: hsl(var(--muted-foreground));
            margin: 0.75rem 0;
            font-style: italic;
          }
        `,
                }}
            />
        </div>
    );
}
