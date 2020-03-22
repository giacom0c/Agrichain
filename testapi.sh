#!/bin/bash
echo "Test apis..."
# Adding a new oil batch
curl -H "Content-Type: application/json" --request POST --data '{ "id":"oil-161016cc", "origin":"Narni" }' http://localhost:8000/oil
sleep 1
# Adding a new attribute to that batch
curl -H "Content-Type: application/json" --request POST --data '{ "attributeId":"weight", "content": 85 }' http://localhost:8000/oil/oil-161016cc/add-attribute
# More to come... WIP
echo "End test"
