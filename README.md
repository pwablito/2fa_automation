# 2FA Automation

A Chrome extension for automating the 2FA setup and disable process

## Development

Adding scripts to this codebase involves the tedious process of converting XPaths to JavaScript `querySelector`s.
These `querySelector`s are then used to click on or manipulate the elements on the web pages.

To make this tedious conversion process simpler, use the VSCode extension [Select by XPath](https://marketplace.visualstudio.com/items?itemName=pwablito.select-by-xpath).
The source for the extension can be found [here](https://github.com/pwablito/select_by_xpath).

Be sure to use full XPaths because the VSCode extension doesn't yet support partial paths.