import React from 'react';
import {create} from 'react-test-renderer';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {RCrop as RCropper, applyDefaultOptions} from '../src/r-crop';

const image =
    'https://cdn.pixabay.com/photo/2023/07/10/06/52/trail-8117575_1280.jpg';
const newImage =
    'https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_1280.jpg';

describe('R crop render tests', () => {
    test('R crop snapshot', () => {
        const ref = React.createRef<HTMLImageElement>();
        const component = create(<RCropper src={image} ref={ref} />).toJSON();
        expect(component).toMatchSnapshot();
    });

    test('renders cropper and calls onInitialized', async () => {
        const onInitialized = jest.fn();
        const ref = React.createRef<HTMLImageElement>();
        render(
            <RCropper src={image} onInitialized={onInitialized} ref={ref} />,
        );
        await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
    });

    test('cropper re-renders on src change', async () => {
        const ref = React.createRef<HTMLImageElement>();
        const {rerender, findByAltText} = render(
            <RCropper src={image} ref={ref} />,
        );
        const imageTag = await findByAltText('picture');
        expect(imageTag).toHaveAttribute('src', image);
        rerender(<RCropper src={newImage} ref={ref} />);
        expect(imageTag).toHaveAttribute('src', newImage);
    });

    test('renders cropper without ref and calls onInitialized', async () => {
        const onInitialized = jest.fn();
        render(<RCropper src={image} onInitialized={onInitialized} />);
        await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
    });

    test('renders cropper with functional ref - method invoked', async () => {
        const onInitialized = jest.fn();
        const ref = jest.fn();
        render(
            <RCropper src={image} onInitialized={onInitialized} ref={ref} />,
        );
        await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(ref).toHaveBeenCalled());
    });

    test('renders cropper with functional ref and check ref exists', async () => {
        const onInitialized = jest.fn();
        let ref: HTMLImageElement;
        const {rerender} = render(
            <RCropper
                src={image}
                onInitialized={onInitialized}
                ref={(cropperRef) => (ref = cropperRef)}
            />,
        );
        await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
        expect(ref.src).toEqual(image);
        rerender(<RCropper src={newImage} />);
        expect(ref.src).toEqual(newImage);
    });

    test('renders cropper with zoomTo prop', async () => {
        const onInitialized = jest.fn();
        render(
            <RCropper
                src={newImage}
                onInitialized={onInitialized}
                zoomTo={1}
            />,
        );
        await waitFor(() => expect(onInitialized).toHaveBeenCalledTimes(1));
    });
});

describe('Test RCropper Methods', () => {
    const enable = jest.fn();
    const scaleX = jest.fn();
    const scaleY = jest.fn();
    const rotateTo = jest.fn();
    const zoomTo = jest.fn();
    const disable = jest.fn();

    let cropper;
    beforeAll(() => {
        cropper = {enable, disable, scaleX, scaleY, rotateTo, zoomTo};
    });

    test('Test applyDefaultOptions with default params', () => {
        applyDefaultOptions(cropper);
        expect(enable).toHaveBeenCalledTimes(1);
        expect(disable).toHaveBeenCalledTimes(0);

        expect(scaleX).toHaveBeenCalledWith(1);
        expect(scaleY).toHaveBeenCalledWith(1);
        expect(scaleX).toHaveBeenCalledTimes(1);
        expect(scaleY).toHaveBeenCalledTimes(1);

        expect(zoomTo).toHaveBeenCalledTimes(0);
        expect(rotateTo).toHaveBeenCalledTimes(0);
    });

    test('Test applyDefaultOptions with custom params', () => {
        applyDefaultOptions(cropper, {enable: false, zoomTo: 1, rotateTo: 90});
        expect(enable).toHaveBeenCalledTimes(0);
        expect(disable).toHaveBeenCalledTimes(1);
        expect(zoomTo).toHaveBeenCalledWith(1);
        expect(zoomTo).toHaveBeenCalledTimes(1);
        expect(rotateTo).toHaveBeenCalledTimes(1);
    });
});
