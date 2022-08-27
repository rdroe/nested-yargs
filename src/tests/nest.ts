
export default [
    [
        'nest one two three --async --c:n nest-async-test'
    ]
]

/**
cache get result:
[
  {
    "commands": [
      "nest",
      "one",
      "two",
      "three"
    ],
    "names": [
      "nest-async-test"
    ],
    "value": {
      "isMultiResult": false,
      "argv": {
        "_": [
          "nest",
          "one",
          "two",
          "three"
        ],
        "async": true,
        "c:n": [
          "nest-async-test"
        ],
        "names": [
          "nest-async-test"
        ],
        "$0": ""
      },
      "result": {
        "result": [
          {
            "result": {
              "msg": "from one/index.ts"
            }
          },
          {
            "result": {
              "msg": "from two/index.ts"
            }
          },
          {
            "result": {
              "msg": "from three/index.ts"
            }
          }
        ],
        "argv": {
          "_": [
            "nest"
          ],
          "async": true,
          "c:n": [
            "nest-async-test"
          ],
          "names": [
            "nest-async-test"
          ],
          "$0": "",
          "positional": [
            "one",
            "two",
            "three"
          ]
        }
      },
      "errorInfo": null
    },
    "createdAt": 1661433979725,
    "id": 549
  }
]
*/

/*
{
    "commands": [
      "nest",
      "one",
      "two",
      "three"
    ],
    "names": [
      "nest-async-test"
    ],
    "value": {
      "isMultiResult": false,
      "argv": {
        "_": [
          "nest",
          "one",
          "two",
          "three"
        ],
        "async": true,
        "c:n": [
          "nest-async-test"
        ],
        "names": [
          "nest-async-test"
        ],
        "$0": ""
      },
      "result": {
        "result": [
          {
            "result": {
              "msg": "from one/index.ts"
            }
          },
          {
            "result": {
              "msg": "from two/index.ts"
            }
          },
          {
            "result": {
              "msg": "from three/index.ts"
            }
          }
        ],
        "argv": {
          "_": [
            "nest"
          ],
          "async": true,
          "c:n": [
            "nest-async-test"
          ],
          "names": [
            "nest-async-test"
          ],
          "$0": "",
          "positional": [
            "one",
            "two",
            "three"
          ]
        }
      },
      "errorInfo": null
    },
    "createdAt": 1661433979725,
    "id": 549
  },
  {
    "commands": [
      "nest",
      "one",
      "two",
      "three"
    ],
    "names": [],
    "value": {
      "msg": "from three/index.ts"
    },
    "createdAt": 1661434198076,
    "id": 550
  }
]
*/
