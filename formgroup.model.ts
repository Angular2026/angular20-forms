const existingKeys = Object.keys(sugrrGroup.controls);
      existingKeys.forEach(key => {
        if (!(key in newFields)) {
          const stale = sugrrGroup.get(key);
          stale?.clearValidators();
          stale?.updateValueAndValidity({ emitEvent: false });
        }
      });
