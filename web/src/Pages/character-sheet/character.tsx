import React, {useEffect, useRef, useState} from 'react'

import {DnDCharacter} from "./sheet/dnd-character";
import CharacterSheet from "./sheet/CharacterSheet";

import axios from "axios";
import {useParams} from "react-router-dom";
import WithAuth from "../login/withAuth";
import TitleService from "../../Service/titleService";
import {useToast} from "@chakra-ui/react";

const API = process.env.REACT_APP_API_PREFIX

// Current HP is intentionally kept out of the bulk autosave so the initiative
// tracker can push HP to the sheet (and the sheet can poll for it) without the
// two clobbering each other. Compare everything *except* hp to decide whether a
// bulk save is needed.
const stripHp = (c: DnDCharacter) => {
    const {hp, ...rest} = c as any
    return rest
}

const App = () => {
    const id = useParams().id

    const [isMaster, setIsMaster] = useState(true)
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [change, setChange] = useState(false)
    // `primary` lives on the Character document (not the sheet sub-doc), so it is
    // tracked separately from `character` and toggled through its own endpoint.
    const [primary, setPrimary] = useState(false)
    // The backstory document attachment is stored server-side; we only keep its
    // name here to drive the sheet's upload/download controls.
    const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined)

    const toast = useToast()

    // last known current HP — used to detect local edits and to avoid re-applying
    // a polled value that we already have
    const hpRef = useRef<any>(undefined)

    function loadDefaultCharacter() {
        let character: DnDCharacter = {}
        return character
    }

    function updateCharacter(char: DnDCharacter) {
        const hpChanged = (char as any).hp !== (character as any).hp
        const otherChanged = JSON.stringify(stripHp(char)) !== JSON.stringify(stripHp(character))

        setCharacter(char)

        if (hpChanged) {
            hpRef.current = (char as any).hp
            saveHp((char as any).hp)
        }
        if (otherChanged) {
            setChange(true)
        }
    }

    async function send() {
        const data = {character: character, charID: id}

        if (isMaster) {
            axios.post(API + '/api/char', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                setIsMaster(false)
                axios.post(API + `/api/char/me`, data)
                    .catch(() => {
                    })
            })
        } else {
            axios.post(API + `/api/char/me`, data)
                .catch(() => {
                })
        }
    }

    // Persist only the current HP through its dedicated endpoint.
    function saveHp(hp: any) {
        const data = {charID: id, hp}

        if (isMaster) {
            axios.put(API + '/api/char/hp', data).catch(() => {
                setIsMaster(false)
                axios.put(API + '/api/char/me/hp', data).catch(() => {
                })
            })
        } else {
            axios.put(API + '/api/char/me/hp', data).catch(() => {
            })
        }
    }

    function initUpdate(doc: any) {
        hpRef.current = (doc.character as any)?.hp
        setCharacter(doc.character)
        setPrimary(Boolean(doc.primary))
        setAttachmentName(doc.attachment?.name)
    }

    async function recv() {
        if (isMaster) {
            axios.get(API + `/api/char/get/${id}`)
                .then((data) => {
                    initUpdate(data.data);
                })
                .catch(() => {
                    axios.get(API + `/api/char/me/get/${id}`)
                        .then((data) => {
                            initUpdate(data.data);
                        })
                        .catch(() => {
                        })
                })
        } else {
            axios.get(API + `/api/char/me/get/${id}`)
                .then((data) => {
                    initUpdate(data.data);
                })
                .catch(() => {
                })
        }
    }

    // Toggle the primary flag. Mirrors send()/saveHp(): try the privileged
    // endpoint first, fall back to the self-scoped one for a plain owner.
    function togglePrimary() {
        const next = !primary
        setPrimary(next)

        const onError = () => {
            setPrimary(!next)
            toast({title: 'Fehler', description: 'Primär-Status konnte nicht geändert werden.', status: 'error', duration: 3000, isClosable: true})
        }
        const own = () => axios.put(API + '/api/char/me/primary/toggle', {charID: id}).catch(onError)

        if (isMaster) {
            axios.put(API + '/api/char/primary/toggle', {charID: id})
                .catch(() => {
                    setIsMaster(false)
                    own()
                })
        } else {
            own()
        }
    }

    // Upload/replace the backstory document. Mirrors send(): try the privileged
    // endpoint first, fall back to the self-scoped one for a plain owner.
    function uploadAttachment(file: File) {
        const form = new FormData()
        form.append('file', file)

        const onOk = () => setAttachmentName(file.name)
        const onError = () => toast({title: 'Fehler', description: 'Datei konnte nicht hochgeladen werden.', status: 'error', duration: 3000, isClosable: true})
        const own = () => axios.post(API + `/api/char/me/${id}/attachment`, form).then(onOk).catch(onError)

        if (isMaster) {
            axios.post(API + `/api/char/${id}/attachment`, form).then(onOk).catch(() => {
                setIsMaster(false)
                own()
            })
        } else {
            own()
        }
    }

    // Download the stored backstory document as a blob and save it locally.
    function downloadAttachment() {
        const save = (blob: Blob) => {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = attachmentName || 'attachment'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
        const onError = () => toast({title: 'Fehler', description: 'Datei konnte nicht heruntergeladen werden.', status: 'error', duration: 3000, isClosable: true})
        const own = () => axios.get(API + `/api/char/me/${id}/attachment`, {responseType: 'blob'}).then((r) => save(r.data)).catch(onError)

        if (isMaster) {
            axios.get(API + `/api/char/${id}/attachment`, {responseType: 'blob'}).then((r) => save(r.data)).catch(() => {
                setIsMaster(false)
                own()
            })
        } else {
            own()
        }
    }

    useEffect(() => {
        recv()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (change) {
            send().then(() => {
                setChange(false)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [change, isMaster])

    // Poll for externally-changed current HP (e.g. pushed from the initiative
    // tracker) every 10 seconds and update the sheet without triggering a save.
    useEffect(() => {
        const applyHp = (hp: any) => {
            if (hp === undefined) return
            if (hp === hpRef.current) return
            hpRef.current = hp
            setCharacter((c) => ({...c, hp}))
        }

        const poll = () => {
            const onMe = () => axios.get(API + `/api/char/me/hp/${id}`)
                .then((r) => applyHp(r.data?.hp))
                .catch(() => {
                })

            if (isMaster) {
                axios.get(API + `/api/char/hp/${id}`)
                    .then((r) => applyHp(r.data?.hp))
                    .catch(onMe)
            } else {
                onMe()
            }
        }

        const interval = setInterval(poll, 10000)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isMaster])


    return (
        <>
            <TitleService title={character.name || ''}/>
            <div style={{"marginLeft": "auto", "marginRight": "auto", maxWidth: "1200px"}}>
                <CharacterSheet character={character} onCharacterChanged={updateCharacter}
                                primary={primary} onPrimaryChanged={togglePrimary}
                                attachmentName={attachmentName}
                                onUploadAttachment={uploadAttachment}
                                onDownloadAttachment={downloadAttachment}/>
            </div>
        </>
    )
}


export default WithAuth(App)
