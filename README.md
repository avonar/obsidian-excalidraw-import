# Excalidraw Import Plugin for Obsidian

Импорт Excalidraw сцен из публичных URL прямо в Obsidian.

## Возможности

- Импорт Excalidraw сцен по URL из `excalidraw.com`
- Поддержка `#json=ID,KEY` формата
- Поддержка `#room=ROOM_ID,KEY` формата (если комната сохранена на сервере)
- Автоматическое сохранение в папку `logs`
- Автоматическое именование файлов: `DD-MM-YY.excalidraw`

## Установка

1. Скопируйте файлы `main.js` и `manifest.json` в папку `.obsidian/plugins/excalidraw-import/` вашего хранилища
2. Перезапустите Obsidian
3. Включите плагин в настройках: Settings → Community plugins → Excalidraw Import

## Использование

1. Откройте палитру команд (`Cmd+P` на Mac, `Ctrl+P` на Windows/Linux)
2. Введите "EXCALIDRAW Import"
3. Вставьте URL Excalidraw сцены, например:
   - `https://excalidraw.com/#json=iZjneM_FyVAopRFr6j0HR,oUua4UgiBHpuehmPsp3MCg`
   - `https://excalidraw.com/#room=0092a02178818466c0e1,ACB6VbVxr9z12Gw2RVaejA`
4. Нажмите OK
5. Файл будет сохранен в папке `logs` с именем вида `22-11-25.excalidraw`

## Разработка

```bash
# Установить зависимости
npm install

# Собрать плагин
npm run build

# Запустить тесты
npm test
```

## Лицензия

MIT
