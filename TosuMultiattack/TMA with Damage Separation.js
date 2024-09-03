on('chat:message', function(msg) {
    if(msg.type === 'whisper' && msg.content.startsWith('!Multiattack')) {
        const args = msg.content.split(' ');
        const characterName = args[2];
        const weaponName = args[3];
        const numAttacks = parseInt(args[4], 10);

        const character = findObjs({
            _type: 'character',
            name: characterName
        })[0];

        if (!character) {
            sendChat('System', '/w "' + msg.who + '" Character not found.');
            return;
        }

        const attackRolls = [];
        for (let i = 0; i < numAttacks; i++) {
            attackRolls.push(`[[1d20 + @{${characterName}|${weaponName}_attack_bonus}]]`);
        }

        sendChat('System', '/w "' + msg.who + '" Rolling ' + numAttacks + ' attack rolls: ' + attackRolls.join(', '), function(ops) {
            let content = ops[0].content;
            sendChat('System', '/w "' + msg.who + '" How many attacks hit?');
            sendChat('System', '/w "' + msg.who + '" How many attacks were critical hits?');
            
            on('chat:message', function(response) {
                if(response.type === 'whisper' && response.who === msg.who) {
                    const inputs = response.content.split(' ');
                    const hits = parseInt(inputs[0], 10);
                    const crits = parseInt(inputs[1], 10);

                    if (isNaN(hits) || isNaN(crits)) {
                        sendChat('System', '/w "' + msg.who + '" Please enter valid numbers for hits and crits.');
                        return;
                    }

                    let cumulativeDamage = 0;
                    let damageResults = '';
                    let critDamageResults = '';

                    const damageTypes = ['thunder', 'acid', 'slashing']; // Modify these based on weapon damage types
                    damageTypes.forEach(type => {
                        const damageRolls = [];
                        for (let i = 0; i < hits; i++) {
                            damageRolls.push(`[[${getAttrByName(character.id, weaponName + '_damage_dice_' + type)} + ${getAttrByName(character.id, weaponName + '_damage_bonus_' + type)}]]`);
                        }

                        const critDamageRolls = [];
                        for (let i = 0; i < crits; i++) {
                            critDamageRolls.push(`[[${getAttrByName(character.id, weaponName + '_damage_dice_' + type)} + ${getAttrByName(character.id, weaponName + '_damage_bonus_' + type)} + ${getAttrByName(character.id, weaponName + '_damage_dice_' + type)}]]`);
                        }

                        sendChat('System', '/w "' + msg.who + '" Rolling ' + hits + ' hits (' + type + ' damage): ' + damageRolls.join(', '), function(damageOps) {
                            let damageTotal = 0;
                            damageOps.forEach(op => {
                                let damageValue = parseInt(op.content.match(/(\d+)/)[0], 10);
                                cumulativeDamage += damageValue;
                                damageTotal += damageValue;
                            });
                            damageResults += `Total ${type} damage: ${damageTotal}\n`;
                        });

                        sendChat('System', '/w "' + msg.who + '" Rolling ' + crits + ' critical hits (' + type + ' damage): ' + critDamageRolls.join(', '), function(critDamageOps) {
                            let critDamageTotal = 0;
                            critDamageOps.forEach(op => {
                                let critDamageValue = parseInt(op.content.match(/(\d+)/)[0], 10);
                                cumulativeDamage += critDamageValue;
                                critDamageTotal += critDamageValue;
                            });
                            critDamageResults += `Total critical ${type} damage: ${critDamageTotal}\n`;
                        });
                    });

                    sendChat('System', '/w "' + msg.who + '" Damage Results:\n' + damageResults + critDamageResults);
                    sendChat('System', '/w "' + msg.who + '" Cumulative Damage: ' + cumulativeDamage);
                }
            });
        });
    }
});
