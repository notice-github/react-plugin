import type { NTCParams } from '@notice-org/ntc'
import type { FC, ReactElement } from 'react'

import { NTCBrowser } from '@notice-org/ntc'
import { useEffect, useRef, useState } from 'react'

interface Props extends NTCParams {
	children?: ReactElement
}

export const Notice: FC<Props> = (props) => {
	const state = useRef<'idle' | 'loading' | 'success' | 'error'>('idle')
	const lastProps = useRef<Props>(props)
	const abortController = useRef<AbortController>(new AbortController())
	const [body, setBody] = useState<ReactElement | null>(null)

	useEffect(() => {
		if (haveDiff(lastProps.current, props)) {
			state.current = 'idle'
			lastProps.current = props
			abortController.current.abort()
			abortController.current = new AbortController()
		}

		if (state.current !== 'idle') return
		state.current = 'loading'

		const { pageId, navigationType = 'memory', children, ...params } = props

		NTCBrowser.queryDocument(pageId, { navigationType, ...params }, { signal: abortController.current.signal }).then(
			(res) => {
				if (!res.ok) {
					if (res.error !== 'aborted') state.current = 'error'
					return
				}

				state.current = 'success'

				const wrapper = extractWrapper(res.data)
				setBody(
					<div id={wrapper.id} className="NTC_wrapper" dangerouslySetInnerHTML={{ __html: wrapper.innerHTML }}></div>
				)
			}
		)
	}, [props])

	if (!body) return props.children ?? <></>
	return body
}

const haveDiff = (props1: Props, props2: Props) => {
	const { children: _, ...cleanedProps1 } = props1
	const { children: __, ...cleanedProps2 } = props2

	return JSON.stringify(cleanedProps1) !== JSON.stringify(cleanedProps2)
}

const extractWrapper = (body: string) => {
	const regex = /^\s*<div id="([0-9a-f\-]{36})" class="NTC_wrapper">((.|\n)+)<\/div>\s*$/i
	const [_, id, innerHTML] = body.match(regex) ?? []
	return { id, innerHTML }
}
