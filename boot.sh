#!/bin/bash
echo "Starting project..."
# Intalling prereqs and building the local network with Hurley
npm install
sleep 1
npm run env:restart
sleep 1
# Installing the chaincode on the channel
npm run cc:start -- oil
sleep 1
echo "Local network is UP, adding members and products..."
sleep 2
# Creating first member (admin)
hurl invoke oil member_register gov "Regione_Umbria" -u admin
# Adding more members
hurl invoke oil member_register aa123 "Azienda Agricola Rossi" -u admin
hurl invoke oil member_register fr123 "Frantoio Umbro Bianchi" -u admin
hurl invoke oil member_register cn123 "Bottiglieria Verdi" -u admin
# Creating a new batch of olives
hurl invoke oil oil_create "{\"id\":\"oil-12cd58ff\", \"origin\": \"Perugia\"}" -u admin
# Adding an attribute to that batch
hurl invoke oil oil_addAttribute "oil-12cd58ff" "{\"id\": \"weigth\", \"certifierID\": \"aa123\", \"content\": \"111\", \"harvested\": 1578355200 }" -u admin
sleep 1
echo "END"
