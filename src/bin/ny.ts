#!/usr/bin/env node

// Sample application for github repo

import  { CommandModule, Options } from 'yargs'
import { AppOptions, AppArgv } from '../../index'
import setUp from './setUp'

const modules: CommandModule[] = [ /* testModule */ ]

setUp(modules)
