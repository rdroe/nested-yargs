import { Module } from '../../shared/utils/types'

import get from './get'
import back from './back'
import put from './put'
import eval from './eval'
import imp from './import'
import clear from './clear'


const cm: Module<{ test: boolean }> = {
    help: {
        description: 'put or get cache vars using indexedDB; also, save or import the backup cache databases.',
        options: {

        },
        examples: {
        }
    },

    fn: async () => {

    },
    submodules: {
        get,
        put,
        eval,
        back,
        import: imp,
        clear
    }
}

export default cm
