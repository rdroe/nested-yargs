#!/usr/bin/env node
import  { CommandModule } from 'yargs'

import setUp from './setUp'
const modules: CommandModule[] = []
setUp(modules)
