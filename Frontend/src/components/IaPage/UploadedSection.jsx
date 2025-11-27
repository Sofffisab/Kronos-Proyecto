import { useEffect, useMemo, useState } from "react";
import Separator from "../Separator";
import style from './ia.module.css'

const formatHeader = (header) => {
    if (!header) {
        return '';
    }
    return header
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function UploadedSection(props) {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (props.file instanceof Blob) {
            const url = URL.createObjectURL(props.file);
            setObjectUrl(url);
            return () => {
                URL.revokeObjectURL(url);
                setObjectUrl(null);
            };
        }

        setObjectUrl(null);
    }, [props.file]);

    const imageSrc = useMemo(() => {
        if (!props.file) {
            return null;
        }

        if (typeof props.file === 'string') {
            if (props.file.startsWith('data:') || props.file.startsWith('http')) {
                return props.file;
            }
            return `data:image/png;base64,${props.file}`;
        }

        if (props.file instanceof Blob) {
            return objectUrl;
        }

        return null;
    }, [props.file, objectUrl]);

    const dataUrlToObjectUrl = (dataUrl) => {
        try {
            const [header, base64Data] = dataUrl.split(',');
            if (!header || !base64Data) {
                return null;
            }

            const mimeMatch = header.match(/data:(.*?);base64/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating object URL from data URI:', error);
            return null;
        }
    };

    const openWindow = () => {
        if (!imageSrc) {
            return;
        }

        if (imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
            window.open(imageSrc, '_blank', 'noopener');
            return;
        }

        if (imageSrc.startsWith('blob:')) {
            window.open(imageSrc, '_blank', 'noopener');
            return;
        }

        if (imageSrc.startsWith('data:')) {
            const blobUrl = dataUrlToObjectUrl(imageSrc);
            if (!blobUrl) {
                return;
            }

            const newTab = window.open(blobUrl, '_blank', 'noopener');
            if (!newTab) {
                URL.revokeObjectURL(blobUrl);
                return;
            }

            const revokeLater = () => URL.revokeObjectURL(blobUrl);
            newTab.addEventListener('unload', revokeLater, { once: true });
            setTimeout(revokeLater, 60000);
            return;
        }
    };

    return(

 <div className={style.section}>
            <Separator/>
            <p >{props.title}</p>
            <Separator/>
            {props.table ? (
                <div className={style.analysisTableContainer}>
                    <div className={style.analysisTableWrapper}>
                        <table className={style.analysisTable}>
                            <thead>
                                <tr className={style.cell}>
                                    {props.table.columns.map((column) => (
                                        <th className={style.cell} key={column}>{formatHeader(column)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {props.table.rows.map((row, rowIndex) => (
                                    <tr key={`row-${rowIndex}`}>
                                        {row.map((cell, cellIndex) => (
                                            <td className={style.cell}key={`cell-${rowIndex}-${cellIndex}`}>
                                                {cell || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : imageSrc? <img onClick={openWindow} className={style.uploadedImage} src={imageSrc} alt={props.title}/> :props.text?
            <p className={style.uploadedTitle}>{props.text}</p> : props.code?
            <div>
                {Array.isArray(props.code) ? (
                    props.code.map((file, index) => (
                        <div key={index}>
                            <h4 className={style.codeTitle}>{file.name}</h4>
                            <pre className={style.codeFormat}><code>{file.content}</code></pre>
                        </div>
                    ))
                ) : (
                    <pre className={style.codeFormat}><code >{props.code}</code></pre>
                )}
            </div> : null}
           
        </div>

    )
}