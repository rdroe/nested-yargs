
export default [
    'match scalar --left testString1 --right testString1 --left testString3 --right testString4',
    `test assert 0.value[].match true --where 'left testString1' --t:c match scalar`
]
