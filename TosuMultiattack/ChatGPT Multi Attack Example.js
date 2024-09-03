on('chat:message', function(msg) {
    if(msg.type === 'api' && msg.content.startsWith('!multiattack')) {
        const args = msg.content.split(' ');
        const characterName = args[1];
        const weaponName = args[2];
        const numAttacks = parseInt(args[3], 10);

        if (!characterName || !weaponName || isNaN(numAttacks)) {
            sendChat('System', '/w "' + msg.who + '" Please use the format: !multiattack character_name weapon_name num_attacks');
            return;
        }

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

                    const damageRolls = [];
                    for (let i = 0; i < hits; i++) {
                        damageRolls.push(`[[${getAttrByName(character.id, weaponName + '_damage_dice')} + ${getAttrByName(character.id, weaponName + '_damage_bonus')}]]`);
                    }

                    const critDamageRolls = [];
                    for (let i = 0; i < crits; i++) {
                        critDamageRolls.push(`[[${getAttrByName(character.id, weaponName + '_damage_dice')} + ${getAttrByName(character.id, weaponName + '_damage_bonus')} + ${getAttrByName(character.id, weaponName + '_damage_dice')}]]`);
                    }

                    sendChat('System', '/w "' + msg.who + '" Rolling damage for ' + hits + ' hits: ' + damageRolls.join(', '));
                    sendChat('System', '/w "' + msg.who + '" Rolling crit damage for ' + crits + ' critical hits: ' + critDamageRolls.join(', '));
                }
            });
        });
    }
});
