import {useEffect} from 'react'

const TitleService = (props: { title: string }) => {

    useEffect(() => {
        document.title = `${props.title} | D&D Companion`
    }, [props.title])

    return null
}

export default TitleService
