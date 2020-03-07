import Sinon from 'sinon';
import { IBuildTask, IUpdateStackTaskConfiguration } from '~build-tasks/build-configuration';
import { BuildTaskProvider, BaseStacksTask } from '~build-tasks/build-task-provider';
import { ICommandArgs } from '~commands/base-command';
import { IUpdateStacksCommandArgs, UpdateStacksCommand } from '~commands/update-stacks';
import { ConsoleUtil } from '../../../src/console-util';

describe('when creating build configuration with duplicate stack name', () => {
    let task: IBuildTask;
    let updateStacksResoruces: sinon.SinonStub;
    const sandbox = Sinon.createSandbox();
    beforeEach(() => {
        const config: IUpdateStackTaskConfiguration = {
            Type: 'update-stacks',
            StackName: 'stack',
            Template: 'path.yml',
            FilePath: './.',
            LogicalName: 'task',
            MaxConcurrentStacks: 1,
            FailedStackTolerance: 1,
        };
        task = BuildTaskProvider.createBuildTask(config, {} as ICommandArgs);

        updateStacksResoruces = sandbox.stub(UpdateStacksCommand, 'Perform');
        sandbox.stub(ConsoleUtil, 'LogInfo')
    });

    afterEach(() => {
        sandbox.restore();
    });
    test('creates task', () => {
        expect(task).toBeDefined();
    });

    test('stackname is used for physicalIdForCleanup', () => {
        expect(task.physicalIdForCleanup).toBe((task as BaseStacksTask).stackName);
    });
    test('template and stackname are passed to updateStackResources', async () => {
        await task.perform();
        const commandArgs = updateStacksResoruces.lastCall.args[0] as IUpdateStacksCommandArgs;
        const fileArg = commandArgs.templateFile;
        const commandKeys = Object.keys(commandArgs);

        expect(fileArg.endsWith('path.yml')).toBe(true);
        expect(commandKeys.length).toBe(4);
        expect(commandKeys).toEqual(expect.arrayContaining(['stackName']));
        expect(commandArgs.stackName).toBe('stack');
    });
});
