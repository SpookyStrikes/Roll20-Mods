on('chat:message', function(msg) {
    if(msg.type === 'api' && msg.content.startsWith('!KoryuGlaive')) {
        const args = msg.content.split(' ');
        const numAttacks = args[1];
        const weaponName = "Koryu Glaive";
        const characterName = "Tosu";
        const cantripName = "Booming Blade";

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
            sendChat('System', '/w "' + msg.who + '" How many attacks were also cantrips?');
            sendChat('System', '/w "' + msg.who + '" Please enter them as three numbers, separated by spaces (e.g. 3 2 1)');
            
            on('chat:message', function(response) {
                if(response.who === msg.who) {
                    const inputs = response.content.split(' ');
                    const hits = parseInt(inputs[0], 10);
                    const crits = parseInt(inputs[1], 10);
                    const cantrips = parseInt(inputs[2], 10);

                    if (isNaN(hits) || isNaN(crits) || isNaN(cantrips)) {
                        sendChat('System', '/w "' + msg.who + '" Please enter valid numbers.');
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
                  
                    const CantripDamageRolls = [];
                    for (let i = 0; i < cantrips; i++) {
                        critDamageRolls.push(`[[${getAttrByName(character.id, cantripName + '_damage_dice')} + ${getAttrByName(character.id, cantripName + '_damage_bonus')} + ${getAttrByName(character.id, cantripName + '_damage_dice')}]]`);
                    }
                  
                    sendChat('System', '/w "' + msg.who + '" Rolling damage for ' + hits + ' hits: ' + damageRolls.join(', '));
                    sendChat('System', '/w "' + msg.who + '" Rolling crit damage for ' + crits + ' critical hits: ' + critDamageRolls.join(', '));
                }
            });
        });
    }
});
